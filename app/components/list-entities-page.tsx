import { type TypedResponse } from '@remix-run/node'
import { Form, Link, useLoaderData, useLocation } from '@remix-run/react'
import BasicTable from './basic-table'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { TableCell, TableRow } from './ui/table'

export type ListEntitiesPageProps = {
	title: string
	description: string
	itemLinkTo?: string
}

export function ListEntitiesPage(props: ListEntitiesPageProps) {
	const data =
		useLoaderData<() => Promise<TypedResponse<{ entities: any[] }>>>()
	const location = useLocation()

	return (
		<BasicTable
			headers={[props.title.slice(0, -1), 'Updated', 'Delete']}
			title={props.title}
			description={props.description}
			actionButton={
				<Button asChild>
					<Link to={`${location.pathname}/new`}>{`New ${props.title}`}</Link>
				</Button>
			}
		>
			{data.entities.map(entity => (
				<TableRow key={entity.id}>
					<TableCell className="font-medium">
						<Link to={`${entity.id}${props.itemLinkTo ?? ''}`} className="hover:underline">
							{entity.name || entity.title || entity.id}
						</Link>
					</TableCell>
					<TableCell>{entity.updatedAtTimeAgo} ago</TableCell>
					<TableCell>
						<Form action={`delete`} method="post">
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
