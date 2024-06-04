import vm from 'node:vm'
import { invariantResponse } from '@epic-web/invariant'
import {
	type ActionFunctionArgs,
	type SerializeFrom,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	Outlet,
	redirect,
	useActionData,
	useLoaderData,
	useMatches,
} from '@remix-run/react'
import React from 'react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import InputDrag from '#app/components/input-with-drag.js'
import { Button } from '#app/components/ui/button.js'
import { Checkbox } from '#app/components/ui/checkbox.js'
import { Input } from '#app/components/ui/input.js'
import { Label } from '#app/components/ui/label.js'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select'
import {
	BuildingDimensions,
	type CalculatedItem,
	CustomInputLookupTable,
	CustomVariableLookupTable,
	PriceLookupTable,
	TakeOffApi,
	createContext,
	createDummyBuildingDimensions,
} from '#app/lib/takeoff'
import { type TakeoffCustomInput } from '#app/lib/takeoff/custom-user-input.js'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { Sidebar } from 'lucide-react'
import SidebarCompoment from './__sidebar'

// export { action } from './__estimation-editor.server.tsx'

export const handle = {
	breadcrumb: 'Edit',
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	await requireUserId(request)
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

	const formDefaults = await prisma.estimate.findFirst({
		where: {
			id: params.estimateId,
		},
		include: {
			formData: true,
		},
	})

	if (formDefaults) {
		const formDefaultsMap = new Map(
			formDefaults.formData.map(input => [input.name, input.value]),
		)

		takeoffModel.inputs = takeoffModel.inputs.map(input => {
			const updatedValue = formDefaultsMap.get(input.name)
			if (updatedValue) {
				input.defaultValue = updatedValue
			}
			return input
		})
	}

	return json({ takeoffModel })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const estimateId = params.estimateId

	const takeoffModel = await prisma.takeoffModel.findFirst({
		include: {
			inputs: true,
			variables: true,
		},
	})

	invariantResponse(takeoffModel, 'Not found', { status: 404 })
	invariantResponse(estimateId, 'Not found', { status: 404 })

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

	const results = takeoffApi
		.getSections()
		.map(section => {
			return section.parts.map(part => {
				return {
					name: part.name,
					priceLookupKey: part.priceLookupKey,
					qty: part.qty,
					pricePerUnit: part.pricePerUnit,
					total: part.total,
					currency: part.currency,
					section: section.name,
				}
			})
		})
		.flat()

	const updatedFormData = takeoffApi.inputs.getLookupHistory().map(input => {
		return {
			name: input.name,
			value: input.defaultValue,
			type: input.type,
		}
	})

	await prisma.estimate.update({
		where: { id: params.estimateId },
		data: {
			results: {
				upsert: results.map(result => {
					return {
						where: { estimateId_name: { estimateId, name: result.name } },
						create: result,
						update: result,
					}
				}),
			},
			formData: {
				upsert: updatedFormData.map(input => {
					return {
						where: { estimateId_name: { estimateId, name: input.name } },
						create: input,
						update: input,
					}
				}),
			},
		},
	})

	return redirect(`/estimates/${params.estimateId}`)
}

export default function TakeoffInputSheet() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const [open, setOpen] = React.useState(false)

	return (
		<>
			<div className="main mt-16 mb-20 px-4 relative">
				<Button
					variant="ghost"
					className="absolute -top-24 right-1"
					onClick={() => setOpen(!open)}
				>
					<Sidebar />
				</Button>
				<Form method="post">
					<div className="m-auto max-w-2xl space-y-4">
						<h1 className="text-2xl">Inputs</h1>
						<div className="text-red-500">{actionData?.result}</div>
						{data.takeoffModel.inputs.map(input => (
							<RenderInput key={input.id} input={input} />
						))}
						<Button>Submit</Button>
					</div>
				</Form>
			</div>
			<SidebarCompoment
				title="Configuration"
				description="Configure the takeoff model."
				open={open}
				onOpenChange={setOpen}
			>
				<SidebarContent />
			</SidebarCompoment>
		</>
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

function SidebarContent() {
	return (
		<div className="px-4">
			<Select>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Select a fruit" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Fruits</SelectLabel>
						<SelectItem value="apple">Apple</SelectItem>
						<SelectItem value="banana">Banana</SelectItem>
						<SelectItem value="blueberry">Blueberry</SelectItem>
						<SelectItem value="grapes">Grapes</SelectItem>
						<SelectItem value="pineapple">Pineapple</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
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
