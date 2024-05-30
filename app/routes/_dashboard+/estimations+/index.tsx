import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { ListEntitiesPage } from '#app/components/list-entities-page.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { formatListTimeAgo } from '#app/utils/misc.js'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const estimations = await prisma.estimation.findMany({
		where: { ownerId: userId },
	})

	invariantResponse(estimations, 'Not found', { status: 404 })

	return json({ entities: formatListTimeAgo(estimations) })
}


export default ListEntitiesPage.bind(null, {
    title: 'Estimations',
    description: 'A list of your estimations.',
})
