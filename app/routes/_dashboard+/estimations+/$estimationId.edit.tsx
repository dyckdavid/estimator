import { invariantResponse } from '@epic-web/invariant'
import vm from 'node:vm'
import {
	ActionFunctionArgs,
	SerializeFrom,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { TakeoffCustomInput } from '#app/lib/takeoff/custom-user-input.js'
import { Label } from '#app/components/ui/label.js'
import { Input } from '#app/components/ui/input.js'
import { Checkbox } from '#app/components/ui/checkbox.js'
import InputDrag from '#app/components/input-with-drag.js'
import React from 'react'
import {
	BuildingDimensions,
	CalculatedItem,
	CustomInputLookupTable,
	CustomVariableLookupTable,
	EstimateSection,
	PriceLookupTable,
	TakeOffApi,
	createContext,
	createDummyBuildingDimensions,
} from '#app/lib/takeoff'
import { getFormProps, useForm } from '@conform-to/react'
import { Button } from '#app/components/ui/button.js'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'

// export { action } from './__estimation-editor.server.tsx'

export const handle = {
	breadcrumb: 'Edit',
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const _userId = await requireUserId(request)
	const takeoffModel = await prisma.takeoffModel.findFirst({
		include: {
			inputs: {
				orderBy: {
					order: 'asc',
				},
			},
		},
	})
	invariantResponse(takeoffModel, 'Not found', { status: 404 })
	return json({ takeoffModel })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()

	const takeoffModel = await prisma.takeoffModel.findFirst({
		include: {
			inputs: true,
			variables: true,
		},
	})

	invariantResponse(takeoffModel, 'Not found', { status: 404 })

	const buildingDimensions = BuildingDimensions.fromObject(
		createDummyBuildingDimensions(),
	)
	const inputsLookupTable = new CustomInputLookupTable(takeoffModel.inputs)
	inputsLookupTable.addFormData(formData)
	const variablesLookupTable = new CustomVariableLookupTable(
		takeoffModel.variables,
	)
	const prices = new PriceLookupTable([] as any)

	const takeoffApi = new TakeOffApi({
		id: takeoffModel.id,
		bd: buildingDimensions,
		prices,
		inputs: inputsLookupTable,
		variables: variablesLookupTable,
	})

	const vmContext = vm.createContext(createContext(takeoffApi))

	try {
		vm.runInContext(takeoffModel.code, vmContext)
	} catch (error: Error | any) {
		return json({
			result: error.message,
			sections: [],
		})
	}

	return json({
		result: 'Success',
		sections: takeoffApi.getSections(),
	})
}

export type EstimationEditLoader = SerializeFrom<typeof loader>

export default function TakeoffInputSheet() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()

	return (
		<div>
			<div className="m-auto flex max-w-5xl justify-end">
				<Button asChild className="ml-auto">
					<Link to={`/takeoff-models/${data.takeoffModel.id}/code`}>
						Edit Code
					</Link>
				</Button>
			</div>
			<Form method="post">
				<div className="m-auto mb-24 mt-16 max-w-2xl space-y-4">
					<h1 className="text-2xl">Inputs</h1>
					<div className="text-red-500">{actionData?.result}</div>
					{data.takeoffModel.inputs.map(input => (
						<RenderInput key={input.id} input={input} />
					))}
					<Button>Submit</Button>
				</div>
			</Form>
			<div className="m-auto max-w-2xl">
				{actionData?.sections.map(section => (
					<EstimateSectionTable key={section.name} section={section} />
				))}
				{/* <pre>{JSON.stringify(actionData, null, 2)}</pre> */}
			</div>
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

	if (input.type === 'number') {
		return (
			<InputDrag
				label={input.label}
				name={input.name}
				defaultValue={input.defaultValue}
			/>
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

type EstimateSectionTableProps = {
	section: {
		name: string
		parts: CalculatedItem[]
	}
}

function EstimateSectionTable({ section }: EstimateSectionTableProps) {
	return (
		<div>
			<h2 className='text-2xl'>{section.name}</h2>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Item</TableHead>
						<TableHead>Material</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Price Per Unit</TableHead>
						<TableHead>Total Price</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{section.parts.map(part => (
						<CalculatedItemRow key={part.name} part={part} />
					))}
				</TableBody>
			</Table>
		</div>
	)
}

type CalculatedItemRowProps = {
	part: CalculatedItem
}

function CalculatedItemRow({ part }: CalculatedItemRowProps) {
	return (
		<TableRow>
			<TableCell>{part.name}</TableCell>
			<TableCell>{part.priceLookupKey}</TableCell>
			<TableCell>{part.qty}</TableCell>
			<TableCell>{part.pricePerUnit}</TableCell>
			<TableCell className="text-right">{part.total}</TableCell>
		</TableRow>
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
