import { prisma } from '#app/utils/db.server.js'
import { CustomVariable } from '@prisma/client'

export type CustomVariableOptions = Pick<CustomVariable, 'name' | 'value' | 'type'>

export async function createCustomVariable(
	customCalculationId: string,
    data: CustomVariableOptions,
) {
	await prisma.customVariable.create({
		data: {
			...data,
			customCalculationId,
		},
	})
}
