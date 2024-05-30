import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { ListEntitiesPage } from '#app/components/list-entities-page.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server'
import { formatListTimeAgo } from '#app/utils/misc.js'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const pricelists = await prisma.pricelist.findMany({
		where: { ownerId: userId },
	})

	invariantResponse(pricelists, 'Not found', { status: 404 })

	return json({ entities: formatListTimeAgo(pricelists) })
}

export default ListEntitiesPage.bind(null, {
	title: 'Pricelists',
	description: 'A list of your pricelists.',
})
