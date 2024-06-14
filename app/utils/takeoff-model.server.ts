import vm from 'node:vm'
import { type Prisma } from '@prisma/client'
import {
	createContext,
	CustomInputLookupTable,
	CustomVariableLookupTable,
	type PricelistItem,
	PriceLookupTable,
	TakeOffApi,
} from '../lib/takeoff'
import { prisma } from './db.server'

type TakeoffModel = Prisma.TakeoffModelGetPayload<{
	select: {
		id: true
		inputs: true
		variables: true
	}
}>

export async function runAndSaveTakeoffModel(
	takeoffModel: TakeoffModel,
	code: string,
	pricelistItems: PricelistItem[],
	formData?: FormData,
) {
	const inputsLookupTable = new CustomInputLookupTable(takeoffModel.inputs)
	if (formData) {
		inputsLookupTable.addFormData(formData)
	}
	const variablesLookupTable = new CustomVariableLookupTable(
		takeoffModel.variables,
	)
	const prices = new PriceLookupTable(pricelistItems)

	const takeoffApi = new TakeOffApi({
		id: takeoffModel.id,
		prices,
		inputs: inputsLookupTable,
		variables: variablesLookupTable,
	})

	const vmContext = vm.createContext(createContext(takeoffApi))
	let logs: string[] = []

	try {
		vm.runInContext(code, vmContext)
	} catch (error: Error | any) {
		logs.push(error.message)
	}

	const inputs = takeoffApi.inputs.getLookupHistory()
	const variables = takeoffApi.variables.getLookupHistory()

	const newTakeoffModel = await prisma.takeoffModel.update({
		where: { id: takeoffModel.id },
		select: {
			id: true,
			inputs: {
				orderBy: {
					order: 'asc',
				},
			},
			variables: true,
		},
		data: {
			code,
			//
			inputs: {
				upsert: inputs.map(input => ({
					where: { name: input.name, id: input.id ?? '__new__' },
					update: {
						label: input.label,
						description: input.description,
						defaultValue: input.defaultValue,
						type: input.type,
						props: input.props,
						order: input.order,
					},
					create: {
						name: input.name,
						label: input.label,
						description: input.description,
						defaultValue: input.defaultValue,
						type: input.type,
						props: input.props,
						order: input.order,
					},
				})),
				deleteMany: {
					name: {
						notIn: inputs.map(input => input.name),
					},
				},
			},
			//
			variables: {
				upsert: variables.map(variable => ({
					where: { name: variable.name, id: variable.id ?? '__new__' },
					update: {
						value: variable.value,
						type: variable.type,
						description: variable.description,
					},
					create: {
						value: variable.value,
						type: variable.type,
						description: variable.description,
						name: variable.name,
					},
				})),
				deleteMany: {
					name: {
						notIn: variables.map(variable => variable.name),
					},
					isManuallyCreated: false,
				},
			},
		},
	})

	return {
		logs,
		takeoffModel: newTakeoffModel,
	}
}
