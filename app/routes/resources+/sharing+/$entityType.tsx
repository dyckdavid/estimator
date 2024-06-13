import { invariantResponse } from '@epic-web/invariant'
import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { UserMinus, UserPlus } from 'lucide-react'
import React from 'react'
import _ from 'underscore'
import { Badge } from '#app/components/ui/badge.js'
import { Button } from '#app/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#app/components/ui/dialog'
import { Input } from '#app/components/ui/input.js'
import { Label } from '#app/components/ui/label.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { requireUserWithPermission } from '#app/utils/permissions.server.js'

type Collaborator = {
	user: {
		id: string
		name: string
		email: string
	}
	accessLevel: string
}

async function getCollaborators(entityId: string, entityType: string) {
	const collaborations = await prisma.collaboration.findMany({
		select: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			action: true,
		},
		where: {
			entityId,
			entity: entityType,
		},
	})

	return _.map(_.groupBy(collaborations, 'user.id'), collaboration => {
		const accessLevels = collaboration.map(({ action }) => action)
		const accessLevel = accessLevels.includes('write') ? 'write' : 'read'

		return {
			user: collaboration[0].user,
			accessLevel,
		}
	})
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireUserId(request)
	const url = new URL(request.url)
	const entityId = url.searchParams.get('entityId')
	const entityType = params.entityType

	invariantResponse(entityId, 'Entity not found', { status: 404 })
	invariantResponse(entityType, 'Entity type not found', { status: 404 })

	const collaborations = await getCollaborators(entityId, entityType)

	return json({ collaborations })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const intent = formData.get('intent')
	const entityType = params.entityType

	invariantResponse(entityType, 'Entity type not found', { status: 404 })

	switch (intent) {
		case 'share':
			return handleEntityShare(request, userId, formData, entityType)
		case 'removeCollaborator':
			return handleRemoveCollaborator(request, userId, formData, entityType)
	}

	return json({
		collaborations: getCollaborators(formData.get('id') as string, entityType),
	})
}
export function SharingDialog({
	entityId,
	entityType,
	disabled,
}: {
	entityId: string
	entityType: string
	disabled?: boolean
}) {
	const fetcher = useFetcher<typeof action>()
	const collaborations = fetcher.data?.collaborations as Collaborator[]

	React.useEffect(() => {
		fetcher.load(`/resources/sharing/${entityType}?entityId=${entityId}`)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [entityId])

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="relative" disabled={disabled}>
					<UserPlus className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Share Pricelist</DialogTitle>
					<DialogDescription>
						Share this pricelist with another user.
					</DialogDescription>
					<p className="text-red-500">
						{(fetcher.data as any)?.error?.message}
					</p>
				</DialogHeader>
				<div className="">
					{collaborations &&
						collaborations?.map(collaboration => (
							<div
								key={collaboration.user.id}
								className="flex items-center justify-between py-2"
							>
								<div>
									<div className="flex justify-between">
										<span>{collaboration.user.name}</span>
										<Badge>{collaboration.accessLevel}</Badge>
									</div>
									<div className="mt-1 text-sm text-gray-500">
										{collaboration.user.email}
									</div>
								</div>
								<div>
									<fetcher.Form
										method="post"
										action={`/resources/sharing/${entityType}`}
									>
										<input type="hidden" name="id" value={entityId} />
										<input
											type="hidden"
											name="collaboratorId"
											value={collaboration.user.id}
										/>
										<Button
											variant="ghost"
											type="submit"
											name="intent"
											value="removeCollaborator"
										>
											<UserMinus className="size-4" />
										</Button>
									</fetcher.Form>
								</div>
							</div>
						))}
				</div>
				<fetcher.Form method="post" action={`/resources/sharing/${entityType}`}>
					<input type="hidden" name="intent" value="share" />
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-3 items-center gap-2">
							<input type="hidden" name="id" value={entityId} />
							<div className="col-span-2">
								<Label htmlFor="email">Email</Label>
								<Input type="email" name="email" required />
							</div>
							<div>
								<Label htmlFor="accessLevel">Access Level</Label>
								<select
									name="accessLevel"
									className="flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
									required
								>
									<option value="read">Read</option>
									<option value="read,write">Write</option>
								</select>
							</div>
						</div>
					</div>
					<DialogFooter className="mt-4">
						<Button type="submit" name="intent" value="share">
							Share
						</Button>
					</DialogFooter>
				</fetcher.Form>
			</DialogContent>
		</Dialog>
	)
}

async function handleEntityShare(
	request: Request,
	userId: string,
	formData: FormData,
	entityType: string,
) {
	const entityId = formData.get('id') as string
	const email = formData.get('email') as string
	const accessLevel = formData.get('accessLevel') as string

	const entity = await (prisma as any)[entityType].findFirst({
		where: {
			id: entityId,
		},
	})

	invariantResponse(entity, 'Not found', { status: 404 })


	// Find user by email
	const user = await prisma.user.findFirst({
		select: {
			id: true,
		},
		where: {
			email: email,
		},
	})

	if (!user) {
		const collaborations = await getCollaborators(entityId, entityType)

		return json(
			{
				error: {
					message:
						'Right now you can only share with users that are already signed up.',
				},
				collaborations,
			},
			{ status: 404 },
		)
	}

	const existingCollaborator = await prisma.collaboration.findFirst({
		where: {
			userId: user.id,
			entityId,
			entity: entityType,
		},
	})

	if (existingCollaborator) {
		const collaborations = await getCollaborators(entityId, entityType)

		return json(
			{
				error: {
					message: 'User is already a collaborator.',
				},
				collaborations,
			},
			{ status: 400 },
		)
	}

	const actions = accessLevel.split(',')
    console.assert(actions.length > 0, 'actions.length > 0')

	for (const action of actions) {
		await prisma.collaboration.create({
			data: {
				action,
				entity: entityType,
				entityId: entityId,
				userId: user.id,
			},
		})
	}

	return json({
		collaborations: await getCollaborators(entityId, entityType),
	})
}

async function handleRemoveCollaborator(
	request: Request,
	userId: string,
	formData: FormData,
	entityType: string,
) {
	const entityId = formData.get('id') as string
	const collaboratorId = formData.get('collaboratorId') as string

	const entity = await (prisma as any)[entityType].findFirst({
		where: {
			id: entityId,
		},
	})

	invariantResponse(entity, 'Not found', { status: 404 })

    const isOwner = entity.ownerId === userId

    invariantResponse(isOwner, 'Unauthorized', { status: 403 })

	const collaborationIds = await prisma.collaboration.findMany({
		select: {
			id: true,
		},
		where: {
			userId: collaboratorId,
			entityId: entityId,
			entity: entityType,
		},
	})

	invariantResponse(collaborationIds, 'Not found', { status: 404 })

	await prisma.collaboration.deleteMany({
		where: {
			id: {
				in: collaborationIds.map(({ id }) => id),
			},
		},
	})

	const collaborations = await getCollaborators(entityId, entityType)

	return json({ collaborations })
}
