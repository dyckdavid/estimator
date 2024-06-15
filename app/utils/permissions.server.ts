import { json } from '@remix-run/node'
import { requireUserId } from './auth.server.ts'
import { prisma } from './db.server.ts'
import { type PermissionString, parsePermissionString } from './user.ts'

/**
 * This is a mapping of entity names to
 * their corresponding names on the user model.
 */
const userEntityMappings: Record<string, string> = {
	takeoffModel: 'models',
	pricelist: 'pricelists',
	estimate: 'estimates',
}

type AuthenticatedUser = {
	userId: string
	isOwner: boolean
	isShared: boolean
	accessLevels: string | null
}

type Entity = {
	id: string
	ownerId?: string
}

/**
 * This function first gets the signed-in user.
 * Then it checks if the user owns the entity with the given id.
 * If the user does not own the entity, it checks if the user has collab access to the entity.
 * And finally, if the user does not have collab access, it checks if the user has the given permission.
 * If the user does not have the permission, it throws an error.
 *
 * If no entity is provided, it just checks if the user has the given permission.
 *
 * @returns If entity is provided, it returns an object of userId, isOwner, isShared, and accessLevels.
 */
export async function requireUserWithPermission(
	request: Request,
	permission: PermissionString,
): Promise<string>

export async function requireUserWithPermission<T extends Entity>(
	request: Request,
	permission: PermissionString,
	entity: T,
): Promise<AuthenticatedUser>

export async function requireUserWithPermission(
	request: Request,
	permission: PermissionString,
	entity?: Entity,
): Promise<string | AuthenticatedUser> {
	const userId = await requireUserId(request)
	const permissionData = parsePermissionString(permission)

	if (!entity) {
		const user = await prisma.user.findFirst({
			select: { id: true },
			where: {
				id: userId,
				roles: {
					some: {
						permissions: {
							some: {
								entity: permissionData.entity,
								action: permissionData.action,
								access: permissionData.access
									? { in: permissionData.access }
									: undefined,
							},
						},
					},
				},
			},
		})

		if (!user) {
			throw json(
				{
					error: 'Unauthorized',
					requiredPermission: permissionData,
					message: `Unauthorized: required permissions: ${permission}`,
				},
				{ status: 403 },
			)
		}

		return userId
	}

	if (!entity.id) {
		throw new Error('entity.id is required')
	}

	if (entity?.ownerId === userId) {
		return {
			userId,
			isOwner: true,
			isShared: false,
			accessLevels: null,
		}
	}

	// this is a little hacky, but it works
	const entityAccessor = userEntityMappings[permissionData.entity] as 'models' | 'pricelists' | 'estimates'

	const user = await prisma.user.findFirst({
		select: {
			id: true,
			[entityAccessor]: {
				where: { id: entity.id },
			},
            shared: {
                where: {
                    entityId: entity.id,
                    entity: permissionData.entity,
                    accessLevel: {
                        contains: permissionData.action,
                    },
                },
            }
		},
		where: {
			id: userId,
			OR: [
				// User owns the entity
				{
					[entityAccessor]: {
						some: { id: entity.id, ownerId: userId },
					},
					roles: {
						some: {
							permissions: {
								some: {
									entity: permissionData.entity,
									action: permissionData.action,
									access: 'own',
								},
							},
						},
					},
				},

				// User has collab access to the entity
				{
					shared: {
						some: {
							entityId: entity.id,
							entity: permissionData.entity,
							accessLevel: {
								contains: permissionData.action,
							},
						},
					},
				},
			],
		},
	})

	if (!user) {
		throw json(
			{
				error: 'Unauthorized',
				requiredPermission: permissionData,
				message: `Unauthorized: required permissions: ${permission}`,
			},
			{ status: 403 },
		)
	}

    const shared = user.shared as { accessLevel?: string }[]

	// User owns the entity or has collab access and has the required permission
	return {
		userId,
		isOwner: user[entityAccessor].length > 0,
		isShared: shared.length > 0,
        accessLevels: shared[0]?.accessLevel ?? null,
	}
}

// export async function requireUserWithPermission(
// 	request: Request,
// 	permission: PermissionString,
// 	entityId?: string,
// ) {
// 	const userId = await requireUserId(request)
// 	const permissionData = parsePermissionString(permission)

// 	if (permissionData.access?.includes('shared')) {
//         if (!entityId) {
//             throw new Error('entityId is required')
//         }

// 		const user = await prisma.user.findFirst({
// 			select: { id: true },
// 			where: {
// 				id: userId,
// 				shared: {
// 					some: {
// 						entityId: entityId,
// 						entity: permissionData.entity,
// 						action: permissionData.action,
// 					},
// 				},
// 			},
// 		})

//         if (user) {
//             return user.id
//         }
// 	}

// 	const user = await prisma.user.findFirst({
// 		select: { id: true },
// 		where: {
// 			id: userId,
// 			roles: {
// 				some: {
// 					permissions: {
// 						some: {
// 							...permissionData,
// 							access: permissionData.access
// 								? { in: permissionData.access }
// 								: undefined,
// 						},
// 					},
// 				},
// 			},
// 		},
// 	})

// 	if (!user) {
// 		throw json(
// 			{
// 				error: 'Unauthorized',
// 				requiredPermission: permissionData,
// 				message: `Unauthorized: required permissions: ${permission}`,
// 			},
// 			{ status: 403 },
// 		)
// 	}
// 	return user.id
// }

export async function requireUserWithRole(request: Request, name: string) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findFirst({
		select: { id: true },
		where: { id: userId, roles: { some: { name } } },
	})
	if (!user) {
		throw json(
			{
				error: 'Unauthorized',
				requiredRole: name,
				message: `Unauthorized: required role: ${name}`,
			},
			{ status: 403 },
		)
	}
	return user.id
}

export async function isUserAdmin(userId: string) {
	const user = await prisma.user.findFirst({
		where: {
			id: userId,
			roles: {
				some: {
					name: 'admin',
				},
			},
		},
	})
	return !!user
}
