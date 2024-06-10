import { invariantResponse } from '@epic-web/invariant'
import { prisma } from './db.server'

export async function requireCollaborationWriteAccess(
	userId: string,
	entityId: string,
    entityType: string,
) {
	const entity = await (prisma as any)[entityType].findFirst({
		where: {
			id: entityId,
		},
	})

	invariantResponse(entity, 'Not found', { status: 404 })

	const isOwner = entity.ownerId === userId

	if (isOwner) {
		return
	}

	const collaboration = await prisma.collaboration.findFirst({
		where: {
			userId: userId,
			entityId: entityId,
		},
	})

	invariantResponse(collaboration, 'Not found', { status: 404 })

	invariantResponse(collaboration.accessLevel === 'write', 'Unauthorized', { status: 403 })
}
