import { invariantResponse } from '@epic-web/invariant'
import { SerializeFrom, json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { EstimationEditor } from './__estimation-editor.tsx'
import { TakeoffCustomInput } from '#app/lib/takeoff/custom-user-input.js'
import { Label } from '#app/components/ui/label.js'
import { Input } from '#app/components/ui/input.js'
import { Checkbox } from '#app/components/ui/checkbox.js'

export { action } from './__estimation-editor.server.tsx'

export const handle = {
	breadcrumb: 'Edit',
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const takeoffModel = await prisma.takeoffModel.findFirst({
		include: {
			inputs: true,
		},
	})
	invariantResponse(takeoffModel, 'Not found', { status: 404 })
	return json({ takeoffModel })
}

export type EstimationEditLoader = SerializeFrom<typeof loader>

export default function TakeoffInpt() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="m-auto mb-24 mt-16 max-w-2xl space-y-4">
			<h1 className="text-2xl">Inputs</h1>
			{data.takeoffModel.inputs.map(input => (
				<RenderInput key={input.id} input={input} />
			))}
		</div>
	)
}

type RenderInputProps = {
	input: TakeoffCustomInput
}

function RenderInput({ input }: RenderInputProps) {
	const inputType = input.type === 'string' ? 'text' : input.type

	if (input.type === 'boolean') {
		return (
			<div className="flex items-center space-x-2">
				<Checkbox
					id={input.id}
					name={input.name}
					defaultChecked={JSON.parse(input.defaultValue) as boolean}
				/>
				<label
					htmlFor="terms"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					{input.label}
				</label>
			</div>
		)
	}

	return (
		<div>
			<Label>
				{input.label}
				<Input type={inputType} defaultValue={input.defaultValue} />
			</Label>
		</div>
	)
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
