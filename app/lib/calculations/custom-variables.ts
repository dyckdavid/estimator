import { type Prisma } from '@prisma/client'
import { prisma } from '#app/utils/db.server.js'
import { type ToString, type LookupTable } from './lookup-table'
import { coerce } from './utils'

export type TakeoffCustomVariable = Prisma.CustomVariableGetPayload<{
	select: {
		id: true
		name: true
		description: true
		value: true
		type: true
	}
}>

export type CustomVariableOptions = {
	name: string
	defaultValue: ToString
	type?: 'number' | 'string' | 'boolean'
	description?: string
}

export class CustomVariableLookupTable
	implements
		LookupTable<
			TakeoffCustomVariable,
			CustomVariableOptions,
			CustomVariableCreateBody
		>
{
	table = new Map<string, TakeoffCustomVariable>()
	lookupHistory: CustomVariableCreateBody[] = []

	constructor(variables: TakeoffCustomVariable[]) {
		variables.forEach(variable => {
			this.table.set(variable.name, variable)
		})
	}

	addToLookupHistory(entry: CustomVariableOptions) {
		this.lookupHistory.push({
			name: entry.name,
			description: entry.description,
			value: entry.defaultValue.toString(),
			type: entry.type ?? typeof entry.defaultValue,
		})
	}

	get(
		name: string,
		defaultValue: ToString,
		options?: Omit<CustomVariableOptions, 'name' | 'defaultValue'>,
	) {
		this.addToLookupHistory({
			name,
			defaultValue,
			...options,
		})

		const variable = this.table.get(name)
		if (!variable) {
			return defaultValue
		}

		return coerce(variable.value, variable.type)
	}

	async saveChanges(takeoffModelId: string) {
		await upsertCustomVariable(takeoffModelId, this.lookupHistory)
	}
}

type CustomVariableCreateBody = Omit<
	Prisma.CustomVariableCreateArgs['data'],
	'takeoffModel'
>

async function upsertCustomVariable(
	takeoffModelId: string,
	variables: CustomVariableCreateBody[],
) {
	await prisma.takeoffModel.update({
		where: {
			id: takeoffModelId,
		},
		data: {
			variables: {
				upsert: variables.map(variable => ({
					where: { name: variable.name, id: takeoffModelId },
					update: variable,
					create: variable,
				})),
				deleteMany: {
					name: {
						notIn: variables.map(variable => variable.name),
					},
				}
			},
		},
	})
}
