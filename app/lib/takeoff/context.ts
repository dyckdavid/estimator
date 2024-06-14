import { BuildingDimensions } from './building-dimensions.class'
import { type TakeOffApi } from './takeoff-api'

export function createContext(takeoffApi: TakeOffApi) {
	function getPrice(name: string) {
		return takeoffApi.prices.get(name)
	}

	function getCategoryItems(category: string) {
		return takeoffApi.prices.getCategoryItems(category)
	}

	function getVariable<T>(
		name: string,
		defaultValue: T,
		options?: Record<string, any>,
	): T {
		return takeoffApi.variables.get(name, defaultValue, options)
	}

	function getUserInput<T>(
		name: string,
		defaultValue: T,
		options?: Record<string, any>,
	): T {
		return takeoffApi.inputs.get(name, defaultValue, options)
	}

	function createSection(name: string) {
		return takeoffApi.createSection(name)
	}

	function getCount(name: string) {
		return takeoffApi.inputs.get(name, 0, {
			componentProps: {
				componentType: 'Counter',
			},
		})
	}

	function insertHeading(name: string, description?: string) {
		return takeoffApi.inputs.get(name, '', {
			description,
			componentProps: {
				componentType: 'Heading',
			},
		})
	}

	return {
		getCount,
		getPrice,
		getVariable,
		getUserInput,
		insertHeading,
		createSection,
		getCategoryItems,
        BuildingDimensions,
	}
}
