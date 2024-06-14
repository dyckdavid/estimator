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
import { EditIcon, LoaderCircle, Settings, Users } from 'lucide-react'
import React from 'react'
import { useSpinDelay } from 'spin-delay'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Button } from '#app/components/ui/button.js'
import { Checkbox } from '#app/components/ui/checkbox.js'
import { Label } from '#app/components/ui/label.js'
import { NativeSelect } from '#app/components/ui/native-select.js'
import {
	CustomInputLookupTable,
	CustomVariableLookupTable,
	PriceLookupTable,
	TakeOffApi,
	createContext,
} from '#app/lib/takeoff'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { runAndSaveTakeoffModel } from '#app/utils/takeoff-model.server.js'
import { RenderInput } from './__render-input'
import SidebarCompoment from './__sidebar'

const TakeoffModelQueryResultsSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		isShared: z.coerce.string().transform(value => value === '1'),
	}),
)

const PricelistsQueryResultsSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		isShared: z.coerce.string().transform(value => value === '1'),
	}),
)

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
					code: true,
					inputs: true,
					variables: true,
				},
			},
			prices: {
				select: {
					id: true,
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
			id: params.estimateId,
		},
	})

	invariantResponse(estimate, 'Not found', { status: 404 })

	const modelsRaw = await prisma.$queryRaw`
        SELECT tm.id, tm.name,
               CASE
                   WHEN c.entityId IS NOT NULL THEN 1
                   ELSE 0
               END AS isShared
        FROM takeoffModel tm
        LEFT JOIN collaboration c ON tm.id = c.entityId AND c.userId = ${userId} AND c.entity = 'takeoffModel'
        WHERE tm.ownerId = ${userId} OR tm.id IN (
            SELECT entityId
            FROM collaboration
            WHERE userId = ${userId} AND entity = 'takeoffModel'
        )
    `

	const models = TakeoffModelQueryResultsSchema.parse(modelsRaw)

	const pricelistsRaw = await prisma.$queryRaw`
        SELECT p.id, p.name,
            CASE
                WHEN c.entityId IS NOT NULL THEN 1
                ELSE 0
            END AS isShared
        FROM pricelist p
        LEFT JOIN collaboration c ON p.id = c.entityId AND c.userId = ${userId} AND c.entity = 'pricelist'
        WHERE p.ownerId = ${userId} OR p.id IN (
            SELECT entityId
            FROM collaboration
            WHERE userId = ${userId} AND entity = 'pricelist'
        )
    `

	const pricelists = PricelistsQueryResultsSchema.parse(pricelistsRaw)

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

	const { takeoffModel, logs } = await runAndSaveTakeoffModel(
		estimate.model,
		estimate.model.code,
		estimate.prices.flatMap(price => price.items),
		estimate.formData.reduce((acc, input) => {
			acc.set(input.name, input.value)
			return acc
		}, new FormData()),
	)

	return json({
		estimate: {
            name: estimate.name,
			model: takeoffModel,
            prices: estimate.prices,
		},
		models,
		pricelists,
		logs,
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
						<Settings />
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
					<Settings />
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
		<fetcher.Form
			method="post"
			onSubmit={handleSubmit}
			className="m-auto flex max-w-2xl items-center justify-between"
		>
			<input type="hidden" name="intent" value="update-name" />
			<input
				ref={inputRef}
				name="name"
				defaultValue={name}
				autoComplete="off"
				className="border-none bg-transparent px-0 text-2xl font-bold focus:outline-none focus:ring-0"
			/>
			{isSaving && <LoaderCircle className="mr-4 animate-spin" />}
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
							{pricelist.isShared && (
								<Users size={16} className="ml-3 inline-block" />
							)}
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
