import { json } from '@remix-run/node'
import { requireUserId } from './auth.server.ts'
import { prisma } from './db.server.ts'
import { type PermissionString, parsePermissionString } from './user.ts'

export async function requireUserWithPermission(
	request: Request,
	permission: PermissionString,
	entityId?: string,
) {
	const userId = await requireUserId(request)
	const permissionData = parsePermissionString(permission)

	if (permissionData.access?.includes('shared')) {
        if (!entityId) {
            throw new Error('entityId is required')
        }

		const user = await prisma.user.findFirst({
			select: { id: true },
			where: {
				id: userId,
				shared: {
					some: {
						entityId: entityId,
						entity: permissionData.entity,
						action: permissionData.action,
					},
				},
			},
		})

        if (user) {
            return user.id
        }
	}

	const user = await prisma.user.findFirst({
		select: { id: true },
		where: {
			id: userId,
			roles: {
				some: {
					permissions: {
						some: {
							...permissionData,
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
	return user.id
}

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
