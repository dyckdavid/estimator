import { invariantResponse } from '@epic-web/invariant'
import {
	type LoaderFunctionArgs,
	json,
	ActionFunctionArgs,
} from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { formatDistanceToNow } from 'date-fns'
import BasicTable from '#app/components/basic-table.js'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { TableCell, TableRow } from '#app/components/ui/table.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server'
import { ListEntitiesPage } from '#app/components/list-entities-page.js'
import { formatListTimeAgo } from '#app/utils/misc.js'
import { isUserAdmin } from '#app/utils/permissions.server.js'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const isAdmin = await isUserAdmin(userId)
	const models = await prisma.takeoffModel.findMany({
		where: { ownerId: isAdmin ? undefined : userId },
	})

	invariantResponse(models, 'Not found', { status: 404 })

	return json({ entities: formatListTimeAgo(models) })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'delete') {
		const id = formData.get('id') as string

		await prisma.takeoffModel.deleteMany({
			where: {
				id: id,
				ownerId: userId,
			},
		})
	}

	return null
}

export default ListEntitiesPage.bind(null, {
	title: 'Models',
	description:
		'These models allow you to define calculations for your takeoffs.',
})
