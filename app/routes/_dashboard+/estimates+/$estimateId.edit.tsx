import vm from 'node:vm'
import { invariantResponse } from '@epic-web/invariant'
import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	redirect,
	useActionData,
	useFetcher,
	useLoaderData,
} from '@remix-run/react'
import { EditIcon, LoaderCircle, Sidebar as SidebarIcon } from 'lucide-react'
import React from 'react'
import { useSpinDelay } from 'spin-delay'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Button } from '#app/components/ui/button.js'
import { Card } from '#app/components/ui/card.js'
import { Checkbox } from '#app/components/ui/checkbox.js'
import { Input } from '#app/components/ui/input.js'
import { Label } from '#app/components/ui/label.js'
import { NativeSelect } from '#app/components/ui/native-select.js'
import {
	BuildingDimensions,
	CustomInputLookupTable,
	CustomVariableLookupTable,
	PriceLookupTable,
	TakeOffApi,
	createContext,
	createDummyBuildingDimensions,
} from '#app/lib/takeoff'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { RenderInput } from './__render-input'
import SidebarCompoment from './__sidebar'

// export { action } from './__estimation-editor.server.tsx'

export const handle = {
	breadcrumb: 'Edit',
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const estimate = await prisma.estimate.findFirst({
		select: {
			name: true,
			formData: true,
			model: {
				select: {
					id: true,
					inputs: true,
				},
			},
			prices: {
				select: {
					id: true,
				},
			},
		},
		where: {
			id: params.estimateId,
		},
	})

	invariantResponse(estimate, 'Not found', { status: 404 })

	const models = await prisma.takeoffModel.findMany({
		select: {
			id: true,
			name: true,
		},
		where: {
			ownerId: userId,
		},
	})

	const pricelists = await prisma.pricelist.findMany({
		select: {
			id: true,
			name: true,
		},
		where: {
			ownerId: userId,
		},
	})

	if (!estimate.model) {
		return json({
			estimate: {
				...estimate,
				model: null,
			},
			models,
			pricelists,
		})
	}

	let formDefaultsMap = new Map()

	if (estimate) {
		estimate.formData.forEach(input => {
			formDefaultsMap.set(input.name, input.value)
		})
	}

	let newModel = {
		...estimate.model,
		inputs: estimate.model.inputs.map(input => {
			const updatedValue = formDefaultsMap.get(input.name)
			let newInput = {
				...input,
				props: JSON.parse(input.props) as Record<string, any>,
			}

			if (updatedValue) {
				newInput.defaultValue = updatedValue
			}

			return newInput
		}),
	}

	return json({
		estimate: {
			...estimate,
			model: newModel,
		},
		models,
		pricelists,
	})
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
		case 'apply-takeoff-configurations':
			return applyConfigurations(estimateId, formData)
		default:
			return null
	}
}

async function submitTakeoffValues(estimateId: string, formData: FormData) {
	const estimate = await prisma.estimate.findFirst({
		select: {
			model: {
				select: {
					id: true,
					code: true,
					inputs: true,
					variables: true,
				},
			},
			prices: {
				select: {
					items: {
						select: {
							id: true,
							name: true,
							unitType: true,
							category: true,
							currency: true,
							pricePerUnit: true,
						},
					},
				},
			},
		},
		where: {
			id: estimateId,
		},
	})

	const takeoffModel = estimate?.model

	invariantResponse(takeoffModel, 'Not found', { status: 404 })

	const buildingDimensions = BuildingDimensions.fromObject(
		createDummyBuildingDimensions(),
	)

	const inputsLookupTable = new CustomInputLookupTable(takeoffModel.inputs)
	inputsLookupTable.addFormData(formData)

	const variablesLookupTable = new CustomVariableLookupTable(
		takeoffModel.variables,
	)

	const prices = new PriceLookupTable(
		estimate.prices.flatMap(price => price.items),
	)

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

	const Sidebar = (
		<SidebarCompoment
			title="Configuration"
			description="Configure the takeoff model."
			open={open}
			onOpenChange={setOpen}
		>
			<SidebarContent />
		</SidebarCompoment>
	)

	if (!data.estimate?.model) {
		return (
			<>
				<div className="main relative mb-20 mt-16 px-4">
					<Button
						variant="ghost"
						className="absolute -top-24 right-1"
						onClick={() => setOpen(!open)}
					>
						<SidebarIcon />
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
				{Sidebar}
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
					<SidebarIcon />
				</Button>
				<EditName name={data.estimate?.name} />
				<Form method="post">
					<div className="m-auto max-w-2xl space-y-4">
						<div className="text-red-500">{actionData?.result}</div>
						{data.estimate.model.inputs.map(input => (
							<RenderInput key={input.id} input={input} />
						))}
						<Button name="intent" value="submit-takeoff-values">
							Submit
						</Button>
					</div>
				</Form>
			</div>
			{Sidebar}
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
			<Card className="m-auto flex max-w-2xl items-center justify-between">
				<Input
					ref={inputRef}
					name="name"
					defaultValue={name}
					autoComplete="off"
					className="border-none text-2xl font-bold"
				/>
				{isSaving && <LoaderCircle className="animate-spin" />}
			</Card>
		</fetcher.Form>
	)
}

async function applyConfigurations(estimateId: string, formData: FormData) {
	const takeoffModelId = formData.get('takeoffModelId') as string
	const pricelists = formData.getAll('pricelist') as string[]
	console.log(pricelists)
	await prisma.estimate.update({
		where: { id: estimateId },
		data: {
			takeoffModelId,
			prices: {
				set: [],
				connect: pricelists.map(pricelist => ({ id: pricelist })),
			},
		},
	})

	return redirect(`/estimates/${estimateId}/edit`)
}

function SidebarContent() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="">
			<Form method="post" className="space-y-4">
				<Label>
					Select Model to Use
					<div className="flex items-center space-x-2">
						<NativeSelect
							name="takeoffModelId"
							defaultValue={data.estimate?.model?.id as string}
						>
							{data.models.map(model => (
								<option key={model.id} value={model.id}>
									{model.name}
								</option>
							))}
						</NativeSelect>
						<Button type="button" variant="ghost" asChild>
							<Link to={`/takeoff-models/${data.estimate?.model?.id}`}>
								<EditIcon />
							</Link>
						</Button>
					</div>
				</Label>
				<h3 className="text-base font-bold">Pricelists</h3>
				{data.pricelists.map(pricelist => (
					<div className="flex items-center space-x-2" key={pricelist.id}>
						<Checkbox
							id={pricelist.id}
							name="pricelist"
							value={pricelist.id}
							defaultChecked={data.estimate?.prices.some(
								price => price.id === pricelist.id,
							)}
						/>
						<label
							htmlFor={pricelist.id}
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{pricelist.name}
						</label>
					</div>
				))}
				<div className="flex w-full justify-end pb-4">
					<Button name="intent" value="apply-takeoff-configurations">
						Apply
					</Button>
				</div>
			</Form>
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
