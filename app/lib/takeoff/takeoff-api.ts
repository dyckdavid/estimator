import { type BuildingDimensions } from './building-dimensions.class'
import {
	upsertCustomInputs,
	type CustomInputLookupTable,
} from './custom-user-input'
import {
	upsertCustomVariable,
	type CustomVariableLookupTable,
} from './custom-variables'
import { type Price, type PriceLookupTable } from './pricelist.class'

type CalculatedItem = {
	name: string
	qty: number
	priceLookupKey: string
	price: Price
	total: Price
}

class EstimateSection {
	constructor(
		public name: string,
		public parts: CalculatedItem[],
		private prices: PriceLookupTable,
	) {
		this.name = name
		this.parts = parts
		this.prices = prices
	}

	addPart({
		name,
		qty,
		priceLookupKey,
	}: {
		name: string
		qty: number
		priceLookupKey: string
	}) {
		const price = this.prices.get(priceLookupKey)
		const total = {
			value: price.value * qty,
			currency: price.currency,
		}

		this.parts.push({
			name,
			qty,
			priceLookupKey,
			price,
			total,
		})

		return this
	}

	serialize() {
		return {
			name: this.name,
			parts: this.parts,
		}
	}
}

export class TakeOffApi {
	public id: string
	public bd: BuildingDimensions
	public prices: PriceLookupTable
	public inputs: CustomInputLookupTable
	public variables: CustomVariableLookupTable

	private sections: EstimateSection[] = []

	constructor({
		id,
		bd,
		prices,
		inputs,
		variables,
	}: {
		id: string
		bd: BuildingDimensions
		prices: PriceLookupTable
		inputs: CustomInputLookupTable
		variables: CustomVariableLookupTable
	}) {
		this.id = id
		this.bd = bd
		this.prices = prices
		this.inputs = inputs
		this.variables = variables
	}

	createSection(name: string) {
		const section = new EstimateSection(name, [], this.prices)
		this.sections.push(section)

		return section
	}

	getSections() {
		return this.sections.map(section => section.serialize())
	}
}

export async function saveTakeOffLookupHistories(takeoffApi: TakeOffApi) {
	await upsertCustomInputs(takeoffApi.id, takeoffApi.inputs.getLookupHistory())
	await upsertCustomVariable(
		takeoffApi.id,
		takeoffApi.variables.getLookupHistory(),
	)
}
