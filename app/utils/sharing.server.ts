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

export async function verifySharedAccess<T extends {id: string}>(
    userId: string,
    entity: T,
    entityType: string,
) {
    const collaboration = await prisma.collaboration.findFirst({
        where: {
            userId: userId,
            entityId: entity.id,
            entityType: entityType,
        },
    })

    invariantResponse(collaboration, `You do not have access to this ${entityType}`, { status: 403 })

    return {
        ...entity,
        isShared: true,
        accessLevel: collaboration.accessLevel,
    }
}
