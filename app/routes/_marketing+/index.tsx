import { Link } from 'react-router'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '#app/components/ui/tooltip.tsx'
import { cn } from '#app/utils/misc.tsx'
import { useOptionalUser } from '#app/utils/user.ts'
import { type Route } from './+types/index.ts'
import { logos } from './logos/logos.ts'

export const meta: Route.MetaFunction = () => [{ title: 'WPM Tester' }]

// Tailwind Grid cell classes lookup
const columnClasses: Record<(typeof logos)[number]['column'], string> = {
	1: 'xl:col-start-1',
	2: 'xl:col-start-2',
	3: 'xl:col-start-3',
	4: 'xl:col-start-4',
	5: 'xl:col-start-5',
}
const rowClasses: Record<(typeof logos)[number]['row'], string> = {
	1: 'xl:row-start-1',
	2: 'xl:row-start-2',
	3: 'xl:row-start-3',
	4: 'xl:row-start-4',
	5: 'xl:row-start-5',
	6: 'xl:row-start-6',
}

export default function Index() {
	const user = useOptionalUser()

	return (
		<main className="font-poppins grid h-full place-items-center">
			<div className="flex flex-col items-center text-center">
				<h1 className="mb-4 text-4xl font-bold">WPM Tester</h1>
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
							Log In
						</Link>
					)}
				</div>
			</div>
		</main>
	)
}
