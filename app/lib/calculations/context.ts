import {
	type CustomInputElement,
	type CustomVariable,
	type Prisma,
} from '@prisma/client'
import {
	BuildingDimensions,
	type BuildingDimensionsData,
} from './building-dimensions.class'
import { type CustomInputElementOptions } from './custom-user-input'
import { setupJobQueue } from './job-queue'
import { Pricelist, PricelistItem } from './pricelist.class'

export type Mode = 'dry-run' | 'live'

type CalculationData = Prisma.CustomCalculationGetPayload<{
	include: {
		CustomVariables: true
		CustomInputElement: true
	}
}>

interface SetupContextArgs {
	buildingDimensions: BuildingDimensionsData
	pricelistData: Pricelist
	customCalculation: CalculationData
	formData?: FormData
	mode: Mode
}

export async function setupContext({
	buildingDimensions,
	customCalculation,
	pricelistData,
	formData,
	mode,
}: SetupContextArgs) {
	const errors = [] as string[]
	const bd = BuildingDimensions.fromObject(buildingDimensions)
	const { addAction, processJobQueue } = setupJobQueue(customCalculation.id)

	const customInputs = new Map<string, CustomInputElement>(
		customCalculation.CustomInputElement.map(input => [input.name, input]),
	)

	const prices = new Map<string, PricelistItem>(
		pricelistData.map(item => [item.name, item]),
	)

	const customVariables = new Map<string, CustomVariable>(
		customCalculation.CustomVariables.map(variable => [
			variable.name,
			variable,
		]),
	)

	function getPrice(name: string) {
		const item = prices.get(name)
		if (!item) {
			errors.push(`Item not found in pricelist: ${name}`)
			return {
				value: NaN,
				currency: '',
			}
		}

		return item
	}

	function getCategoryItems(category: string) {
		return pricelistData.filter(item => item.category === category)
	}

	function getUserInput(
		name: string,
		options: Omit<CustomInputElementOptions, 'name'>,
	) {
		const input = customInputs.get(name)

		if (mode === 'dry-run') {
			addAction('upsert_custom_input', {
				name,
				...options,
			})
		}

		const value = formData?.get(name)

		if (!input || !value) {
			errors.push(`Custom input not found: ${name}`)
			return options.defaultValue
		}

		return value
	}

	function getVariable(
		name: string,
		defaultValue: number | string,
		type: 'number' | 'string' = 'string',
	) {
		const variable = customVariables.get(name)

		if (mode === 'dry-run') {
			addAction('add_custom_variable', {
				name,
				type,
				value: String(defaultValue),
			})

			return defaultValue
		}

		if (!variable) {
			errors.push(`Custom variable not found: ${name}`)
			return defaultValue
		}

		if (variable.type === 'number') {
			return +variable.value
		}

		return variable.value
	}

	return {
		context: {
			bd,
			getPrice,
			getCategoryItems,
			getUserInput,
			getVariable,
		},
		errors,
		processJobQueue,
	}
}
