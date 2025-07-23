import { invariantResponse } from '@epic-web/invariant'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
} from 'chart.js'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { data } from 'react-router'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { type Route } from './+types/stats.ts'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
)

export async function loader({ params, request }: Route.LoaderArgs) {
	await requireUserId(request)
	const { username } = params

	const user = await prisma.user.findUnique({
		where: { username },
		select: { id: true },
	})

	invariantResponse(user, 'User not found', { status: 404 })

	const testResults = await prisma.testResult.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'asc' },
		select: { wpm: true, accuracy: true, createdAt: true },
	})

	const stats = calculateStats(testResults)

	return data({ testResults, stats })
}

function calculateStats(testResults: any[]) {
	if (testResults.length === 0) return null

	const totalWPM = testResults.reduce((sum, result) => sum + result.wpm, 0)
	const totalAccuracy = testResults.reduce(
		(sum, result) => sum + result.accuracy,
		0,
	)

	return {
		averageWPM: Math.round(totalWPM / testResults.length),
		averageAccuracy: Math.round(totalAccuracy / testResults.length),
		bestWPM: Math.max(...testResults.map((result) => result.wpm)),
		bestAccuracy: Math.max(...testResults.map((result) => result.accuracy)),
	}
}

function ClientOnly({
	children,
	fallback = null,
}: {
	children: () => React.ReactNode
	fallback?: React.ReactNode
}) {
	const [hasMounted, setHasMounted] = useState(false)

	useEffect(() => {
		setHasMounted(true)
	}, [])

	if (!hasMounted) {
		return fallback
	}

	return children()
}

export default function UserStats({ loaderData }: Route.ComponentProps) {
	const { testResults, stats } = loaderData

	const chartData = {
		labels: testResults.map((result) =>
			format(new Date(result.createdAt), 'MM/dd HH:mm'),
		),
		datasets: [
			{
				label: 'WPM',
				data: testResults.map((result) => result.wpm),
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: testResults.map((result) =>
					getColorForAccuracy(result.accuracy),
				),
				borderWidth: 2,
				pointRadius: 6,
				pointHoverRadius: 8,
			},
		],
	}

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const result = testResults[context.dataIndex]
						if (!result) return ''
						return `WPM: ${result.wpm}, Accuracy: ${result.accuracy}%`
					},
				},
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: 'Test Timestamp',
				},
				ticks: {
					maxRotation: 45,
					minRotation: 45,
				},
			},
			y: {
				title: {
					display: true,
					text: 'Words Per Minute (WPM)',
				},
				min: 0,
			},
		},
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-4 text-2xl font-bold">Typing Stats</h1>

			{stats ? (
				<div className="mb-8">
					<h2 className="mb-2 text-xl font-semibold">Overall Statistics</h2>
					<p>Average WPM: {stats.averageWPM}</p>
					<p>Average Accuracy: {stats.averageAccuracy}%</p>
					<p>Best WPM: {stats.bestWPM}</p>
					<p>Best Accuracy: {stats.bestAccuracy}%</p>
				</div>
			) : (
				<p>No test results available.</p>
			)}

			<div className="mb-8">
				<h2 className="mb-2 text-xl font-semibold">Performance Over Time</h2>
				<div className="h-[400px]">
					<ClientOnly fallback={<div>Loading chart...</div>}>
						{() => <Line data={chartData} options={chartOptions} />}
					</ClientOnly>
				</div>
			</div>

			{testResults.length > 0 && (
				<div>
					<h2 className="mb-2 text-xl font-semibold">Recent Test Results</h2>
					<ul>
						{testResults
							.slice(-20)
							.reverse()
							.map((result, index) => (
								<li key={index} className="mb-2">
									WPM: {result.wpm}, Accuracy: {result.accuracy}%
									<span className="ml-2 text-sm text-gray-500">
										{format(new Date(result.createdAt), 'MMM d, yyyy HH:mm')}
									</span>
								</li>
							))}
					</ul>
				</div>
			)}
		</div>
	)
}

function getColorForAccuracy(accuracy: number): string {
	// Red for low accuracy, yellow for medium, green for high
	const r = accuracy < 50 ? 255 : Math.round(255 - (accuracy - 50) * 5.1)
	const g = accuracy > 50 ? 255 : Math.round(accuracy * 5.1)
	const b = 0
	return `rgb(${r}, ${g}, ${b})`
}
