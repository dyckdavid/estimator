import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import {
	TableCell,
	TableRow,
} from '#app/components/ui/table.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server'
import { formatDistanceToNow } from 'date-fns'
import BasicTable from '#app/components/basic-table.js'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const pricelists = await prisma.pricelist.findMany({
		where: { ownerId: userId },
	})

	invariantResponse(pricelists, 'Not found', { status: 404 })

	const dateFormattedPriceLists = pricelists.map(pricelist => {
		return {
			...pricelist,
			updatedAtTimeAgo: formatDistanceToNow(new Date(pricelist.updatedAt)),
		}
	})

	return json({ pricelists: dateFormattedPriceLists })
}

export default function Pricelists() {
	const data = useLoaderData<typeof loader>()

	return (
		<BasicTable
			headers={['Pricelist', 'Updated', 'Delete']}
			title="Pricelists"
			description="A list of your pricelists."
			actionButton={
				<Button asChild>
					<Link to="/pricelists/new">New Pricelist</Link>
				</Button>
			}
		>
			{data.pricelists.map(pricelist => (
				<TableRow key={pricelist.id}>
					<TableCell className="font-medium">
						<Link
							to={`/pricelists/${pricelist.id}`}
							className="hover:underline"
						>
							{pricelist.name}
						</Link>
					</TableCell>
					<TableCell>{pricelist.updatedAtTimeAgo} ago</TableCell>
					<TableCell>
						<Form action={`/pricelists/${pricelist.id}/delete`} method="post">
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
