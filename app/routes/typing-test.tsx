import { useState, useRef, useCallback } from "react";
import { requireUserId } from "#app/utils/auth.server.ts";
import { prisma } from "#app/utils/db.server.ts";
import { type Route } from "./+types/typing-test.ts";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const testTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "A journey of a thousand miles begins with a single step.",
    "Where there's a will, there's a way.",
  ];
  const randomText = testTexts[Math.floor(Math.random() * testTexts.length)];

  const recentResults = await prisma.testResult.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    testText: randomText,
    sessionId: Date.now().toString(),
    recentResults,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const sessionId = formData.get("sessionId") as string;
  const keystrokes = JSON.parse(formData.get("keystrokes") as string) as any[];
  const testText = (formData.get("testText") as string) || "";
  const input = formData.get("input") as string;

  const result = validateResult(sessionId, keystrokes, testText, input);

  await prisma.testResult.create({
    data: {
      sessionId,
      wpm: result.wpm,
      accuracy: result.accuracy,
      testText,
      userInput: input,
      userId: userId,
    },
  });

  return result;
}

function validateResult(
  sessionId: string,
  keystrokes: any[],
  testText: string,
  input: string,
) {
  if (keystrokes.length === 0) {
    return { wpm: 0, accuracy: 0, isValid: false };
  }

  const startTime = keystrokes[0].timestamp;
  const endTime = keystrokes[keystrokes.length - 1].timestamp;
  const timeInMinutes = (endTime - startTime) / 60000;
  const wordsTyped = testText.split(" ").length;
  const wpm = Math.round(wordsTyped / timeInMinutes);

  const correctChars = input
    .split("")
    .filter((char, i) => char === testText[i]).length;
  const accuracy = Math.round((correctChars / testText.length) * 100);

  return { wpm, accuracy, isValid: true };
}

export default function TypingTest({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    testText: initialTestText,
    sessionId: initialSessionId,
    recentResults,
  } = loaderData;
  const [testText, setTestText] = useState(initialTestText);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [input, setInput] = useState("");
  const [keystrokes, setKeystrokes] = useState<any[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const submitResult = useCallback(
    (finalInput: string) => {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      formData.set("keystrokes", JSON.stringify(keystrokes));
      formData.set("testText", testText || "");
      formData.set("input", finalInput);

      void fetch("/typing-test", {
        method: "POST",
        body: formData,
      });
    },
    [sessionId, keystrokes, testText],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Allow default behavior for special key combinations
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      e.preventDefault();

      // If the test is completed, don't allow further input
      if (!testText || input.length === testText.length) {
        return;
      }

      if (e.key === "Backspace") {
        if (cursorPosition > 0) {
          setInput((prev) => prev.slice(0, -1));
          setCursorPosition((prev) => prev - 1);
        }
      } else if (e.key.length === 1) {
        const newInput = input + e.key;
        const newCursorPosition = cursorPosition + 1;

        setInput(newInput);
        setCursorPosition(newCursorPosition);
        setKeystrokes((prev) => [
          ...prev,
          { key: e.key, timestamp: Date.now() },
        ]);

        // Check if this is the last character of the test
        if (testText && newCursorPosition === testText.length) {
          submitResult(newInput);
        }
      }
    },
    [input, cursorPosition, testText?.length, submitResult],
  );

  // Using useCallback for focus instead of useEffect
  const focusContainer = useCallback(() => {
    containerRef.current?.focus();
  }, []);

  const getCharClass = (index: number) => {
    if (index < cursorPosition && input) {
      return testText && input[index] === testText[index]
        ? "text-green-500"
        : "text-red-500";
    }
    return "text-gray-300";
  };

  const getDisplayChar = (index: number) => {
    if (index < cursorPosition && input) {
      return input[index];
    }
    return testText?.[index] || "";
  };

  const resetTest = useCallback(() => {
    const newTestText = initialTestText;
    const newSessionId = Date.now().toString();
    setTestText(newTestText);
    setSessionId(newSessionId);
    setInput("");
    setKeystrokes([]);
    setCursorPosition(0);
    focusContainer();
  }, [initialTestText, focusContainer]);

  const visibleTextStart = Math.max(0, cursorPosition - 20);
  const visibleTextEnd = Math.min(testText?.length || 0, cursorPosition + 20);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Typing Speed Test</h1>
      <div
        ref={containerRef}
        className="relative mb-4 h-20 overflow-hidden rounded bg-gray-100 p-2 font-mono text-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={focusContainer}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-pre">
          {(testText || "")
            .slice(visibleTextStart, visibleTextEnd)
            .split("")
            .map((char, index) => {
              const absoluteIndex = visibleTextStart + index;
              return (
                <span
                  key={absoluteIndex}
                  className={`${getCharClass(absoluteIndex)} ${
                    absoluteIndex === cursorPosition
                      ? "border-b-2 border-blue-500"
                      : ""
                  }`}
                >
                  {getDisplayChar(absoluteIndex)}
                </span>
              );
            })}
        </div>
      </div>
      {actionData?.wpm !== undefined && actionData?.accuracy !== undefined && (
        <div className="mb-4">
          <p className="text-xl">Your typing speed: {actionData.wpm} WPM</p>
          <p className="text-xl">Accuracy: {actionData.accuracy}%</p>
        </div>
      )}
      <button
        onClick={resetTest}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        New Test
      </button>

      {recentResults.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Recent Results</h2>
          <ul>
            {recentResults.map((result, index) => (
              <li key={index} className="mb-2">
                WPM: {result.wpm}, Accuracy: {result.accuracy}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
