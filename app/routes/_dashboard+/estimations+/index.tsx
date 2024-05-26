import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { Button } from '#app/components/ui/button.js'
import BasicTable from '#app/components/basic-table.js'
import { invariantResponse } from '@epic-web/invariant'
import { formatDistanceToNow } from 'date-fns'
import { Icon } from '#app/components/ui/icon.js'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const estimations = await prisma.estimation.findMany({
		where: { ownerId: userId },
	})

	invariantResponse(estimations, 'Not found', { status: 404 })

	const dateFormattedEstimations = estimations.map(estimation => {
		return {
			...estimation,
			updatedAt: formatDistanceToNow(new Date(estimation.updatedAt)),
			createdAt: formatDistanceToNow(new Date(estimation.createdAt)),
		}
	})

	return json({ estimations: dateFormattedEstimations })
}

export default function Estimations() {
	const data = useLoaderData<typeof loader>()

	return (
		<BasicTable
			headers={['Estimation', 'Updated', 'Delete']}
			title="Estimations"
			description="A list of your recent estimations."
			actionButton={
				<Button asChild>
					<Link to="/estimations/new">New Estimation</Link>
				</Button>
			}
		>
			{data.estimations?.map(estimation => (
				<TableRow key={estimation.id}>
					<TableCell className="font-medium">
						<Link
							to={`/estimations/${estimation.id}/edit`}
							className="hover:underline"
						>
							{estimation.title}
						</Link>
					</TableCell>
					<TableCell>{estimation.updatedAt} ago</TableCell>
					<TableCell>
						<Form action={`/estimations/${estimation.id}/delete`} method="post">
							<Button type="submit" variant="ghost">
								<Icon name="trash" />
							</Button>
						</Form>
					</TableCell>
				</TableRow>
			))}
		</BasicTable>
	)
}
