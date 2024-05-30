import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import BasicTable from '#app/components/basic-table.js'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import {
	TableCell,
	TableRow,
} from '#app/components/ui/table.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server'
import { ListEntitiesPage } from '#app/components/list-entities-page.js'
import { formatListTimeAgo } from '#app/utils/misc.js'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const models = await prisma.takeoffModel.findMany({
		where: { ownerId: userId },
	})

	invariantResponse(models, 'Not found', { status: 404 })

	return json({ entities: formatListTimeAgo(models) })
}


export default ListEntitiesPage.bind(null, {
    title: 'Takeoff Models',
    description: 'These models allow you to define calculations for your takeoffs.',
})
