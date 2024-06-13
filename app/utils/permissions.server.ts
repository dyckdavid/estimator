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

type RequireUserWithPermissionReturn<EntityId extends string | undefined> =
	EntityId extends undefined
		? string
		: {
				userId: string
				isShared: boolean
				accessLevels: string | null
			}

/**
 * This function first gets the signed-in user.
 * Then it checks if the user owns the entity with the given id.
 * If the user does not own the entity, it checks if the user has collab access to the entity.
 * And finally, if the user does not have collab access, it checks if the user has the given permission.
 * If the user does not have the permission, it throws an error.
 *
 * If no entity id is provided, it just checks if the user has the given permission.
 *
 * @returns If entity id is provided, it returns an object of userId, isShared, and accessLevels.
 */
export async function requireUserWithPermission<T extends undefined>(
	request: Request,
	permission: PermissionString,
): Promise<RequireUserWithPermissionReturn<T>>

export async function requireUserWithPermission<T extends string>(
	request: Request,
	permission: PermissionString,
	entityId: T,
): Promise<RequireUserWithPermissionReturn<T>>

export async function requireUserWithPermission<T extends string | undefined>(
	request: Request,
	permission: PermissionString,
	entityId?: T,
): Promise<RequireUserWithPermissionReturn<T>> {
	const userId = await requireUserId(request)
	const permissionData = parsePermissionString(permission)

	if (entityId) {
		const user = await prisma.user.findFirst({
			select: {
				id: true,
			},
			where: {
				id: userId,
				OR: [
					// User owns the entity
					{
						// this is a little hacky, but it works
						[userEntityMappings[permissionData.entity]]: {
							some: { id: entityId },
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
								entityId,
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

		const collaboration = await prisma.collaboration.findFirst({
			select: { accessLevel: true },
			where: {
				entityId,
				entity: permissionData.entity,
				userId,
			},
		})

		// User owns the entity or has collab access and has the required permission
		return {
			userId,
			isShared: !!collaboration,
			accessLevels: collaboration?.accessLevel ?? null,
		} as RequireUserWithPermissionReturn<T>
	}

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

	return userId as RequireUserWithPermissionReturn<T>
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
