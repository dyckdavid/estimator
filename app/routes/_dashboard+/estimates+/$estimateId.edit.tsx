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
	useFetcher,
	useLoaderData,
	useMatches,
} from '@remix-run/react'
import { LoaderCircle, Sidebar } from 'lucide-react'
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
import SidebarCompoment from './__sidebar'
import { useSpinDelay } from 'spin-delay'
import { Card } from '#app/components/ui/card.js'

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

	const estimate = await prisma.estimate.findFirst({
		where: {
			id: params.estimateId,
		},
		include: {
			formData: true,
		},
	})

	invariantResponse(estimate, 'Not found', { status: 404 })

	if (!takeoffModel) {
		return json({ takeoffModel: null, estimate })
	}

	if (estimate) {
		const formDefaultsMap = new Map(
			estimate.formData.map(input => [input.name, input.value]),
		)

		takeoffModel.inputs = takeoffModel.inputs.map(input => {
			const updatedValue = formDefaultsMap.get(input.name)
			if (updatedValue) {
				input.defaultValue = updatedValue
			}
			return input
		})
	}

	return json({ takeoffModel, estimate })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const estimateId = params.estimateId
	invariantResponse(estimateId, 'Not found', { status: 404 })

	const intent = formData.get('intent') as string

	switch (intent) {
		case 'submit-takeoff-values':
			return submitTakeoffValues(estimateId, formData)
		case 'update-name':
			return updateTakeoffModelName(estimateId, formData)
		default:
			return null
	}
}

async function submitTakeoffValues(estimateId: string, formData: FormData) {
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
		where: { id: estimateId },
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

	return redirect(`/estimates/${estimateId}`)
}

export default function TakeoffInputSheet() {
	const data = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const [open, setOpen] = React.useState(false)

	if (!data.takeoffModel) {
		return (
			<>
				<div className="main relative mb-20 mt-16 px-4">
					<Button
						variant="ghost"
						className="absolute -top-24 right-1"
						onClick={() => setOpen(!open)}
					>
						<Sidebar />
					</Button>
					<div className="space-y-4">
						<EditName name={data.estimate?.name} />
						<div className="flex flex-col items-center gap-4">
							<div className="text-center">No takeoff model found</div>
							<Button className="m-auto" asChild>
								<Link to="/takeoff-models/new">Setup one up</Link>
							</Button>
						</div>
					</div>
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

	return (
		<>
			<div className="main relative mb-20 mt-16 px-4">
				<Button
					variant="ghost"
					className="absolute -top-24 right-1"
					onClick={() => setOpen(!open)}
				>
					<Sidebar />
				</Button>
				<EditName name={data.estimate?.name} />
				<Form method="post">
					<div className="m-auto max-w-2xl space-y-4">
						<div className="text-red-500">{actionData?.result}</div>
						{data.takeoffModel.inputs.map(input => (
							<RenderInput key={input.id} input={input} />
						))}
						<Button name="intent" value="submit-takeoff-values">
							Submit
						</Button>
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

async function updateTakeoffModelName(estimateId: string, formData: FormData) {
	const name = formData.get('name') as string
	await prisma.estimate.update({
		where: { id: estimateId },
		data: { name },
	})

	return null
}

function EditName({ name }: { name?: string }) {
	const fetcher = useFetcher()
	const isSaving = useSpinDelay(fetcher.state === 'submitting', {
		minDuration: 300,
		delay: 0,
	})

	const inputRef = React.useRef<HTMLInputElement>(null)

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()

		// Blur the input element when the form is submitted
		inputRef.current?.blur()

		// Submit the form
		fetcher.submit(event.currentTarget as HTMLFormElement)
	}

	return (
		<fetcher.Form method="post" onSubmit={handleSubmit}>
			<input type="hidden" name="intent" value="update-name" />
			<Card className='flex justify-between items-center max-w-2xl m-auto'>
				<Input
					ref={inputRef}
					name="name"
					defaultValue={name}
                    autoComplete='off'
					className="border-none text-2xl font-bold"
				/>
				{isSaving && <LoaderCircle className="animate-spin" />}
			</Card>
		</fetcher.Form>
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
					<p>No estimate with the id "{params.estimateId}" exists</p>
				),
			}}
		/>
	)
}
