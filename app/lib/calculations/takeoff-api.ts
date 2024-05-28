import { type BuildingDimensions } from './building-dimensions.class'
import { type CustomInputLookupTable } from './custom-user-input'
import { type CustomVariableLookupTable } from './custom-variables'
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

	addPart(name: string, qty: number, priceLookupKey: string) {
		const price = this.prices.getPrice(priceLookupKey)
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
	private sections: EstimateSection[] = []

	constructor(
		public id: string,
		public inputs: CustomInputLookupTable,
		public variables: CustomVariableLookupTable,
		public prices: PriceLookupTable,
		public bd: BuildingDimensions,
	) {
		this.inputs = inputs
		this.variables = variables
		this.prices = prices
		this.bd = bd
	}

	createSection(name: string) {
		const section = new EstimateSection(name, [], this.prices)
		this.sections.push(section)

		return section
	}

	getSections() {
		return this.sections.map(section => section.serialize())
	}

	async cleanup() {
		await this.inputs.saveChanges(this.id)
		await this.variables.saveChanges(this.id)
	}
}
