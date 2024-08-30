import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { useOptionalUser } from '#app/utils/user.ts'

export const meta: MetaFunction = () => [{ title: 'WPM Test' }]

export default function Index() {
	const user = useOptionalUser()

	return (
		<main className="font-poppins grid h-full place-items-center">
			<div className="flex flex-col items-center text-center">
				<h1 className="mb-4 text-4xl font-bold">WPM Test</h1>
				<p className="mb-8 text-xl">
					Test your typing speed and improve your skills!
				</p>
				<div className="space-x-4">
					<Link
						to="/typing-test"
						className="inline-block rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
					>
						Start Typing Test
					</Link>
					{user ? (
						<Link
							to={`/users/${user.username}/stats`}
							className="inline-block rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700"
						>
							View Your Stats
						</Link>
					) : (
						<Link
							to="/login"
							className="inline-block rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
						>
							Login
						</Link>
					)}
				</div>
			</div>
		</main>
	)
}
