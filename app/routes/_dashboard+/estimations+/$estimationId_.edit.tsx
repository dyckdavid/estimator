import { invariantResponse } from '@epic-web/invariant'
import { SerializeFrom, json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { EstimationEditor } from './__estimation-editor.tsx'

export { action } from './__estimation-editor.server.tsx'

export const handle = {
	breadcrumb: 'Edit',
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const estimation = await prisma.estimation.findFirst({
		select: {
			id: true,
			title: true,
            description: true,
			images: {
				select: {
					id: true,
					altText: true,
				},
			},
			dimensions: {
				select: {
					width: true,
					length: true,
					wallHeight: true,
					totalInteriorWallsLength: true,
					roofRisePerFoot: true,
					soffitOverhangWidth: true,
				},
				where: {
					estimationId: params.estimationId,
				},
			},
		},
		where: {
			id: params.estimationId,
			ownerId: userId,
		},
	})
	invariantResponse(estimation, 'Not found', { status: 404 })
	return json({ estimation })
}

export type EstimationEditLoader = SerializeFrom<typeof loader>

export default function EstimationEdit() {
	const data = useLoaderData<typeof loader>()

	return <EstimationEditor estimation={data.estimation} />
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}
