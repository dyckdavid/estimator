import { type BuildingDimensions } from './building-dimensions.class'
import { type PriceLookupTable } from './pricelist.class'

interface CalculationBuildFnContext {
	self: Calculation
	bd: BuildingDimensions
}

interface Part {
	priceLookupKey: string
	qty: number
}

export interface PartWithPrice extends Part {
	price: {
		value: number
		currency: string
	}
}

/**
 * ```
 * const assembly = new Assembly('My Assembly', ({ self, bd }) => {
 *    self.addPart('part1', 2)
 *    self.addPart('part2', 3)
 *    self.addPart('part3', 1)
 * })
 * .build(bd)
 * .resolvePrices(priceLookupTable)
 * ```
 */
export class Calculation {
	name: string
	parts: Part[] = []
	partsWithPrice: PartWithPrice[] = []
	buildFn: (ctx: CalculationBuildFnContext) => void

	constructor(name: string, buildFn: (ctx: CalculationBuildFnContext) => void) {
		this.name = name
		this.buildFn = buildFn
	}

	addPart(priceLookupKey: string, qty: number) {
		this.parts.push({ priceLookupKey, qty })

		return this
	}

	addParts(parts: Part[]) {
		this.parts.push(...parts)

		return this
	}

	build(bd: BuildingDimensions) {
		this.buildFn({ self: this, bd })

		return this
	}

	resolvePrices(priceLookupTable: PriceLookupTable) {
		this.partsWithPrice = this.parts.map(part => {
			const price = priceLookupTable.getPrice(part.priceLookupKey)

			return {
				...part,
				price,
			}
		})

		return this
	}

    serialize() {
        return {
            name: this.name,
            parts: this.partsWithPrice,
        }
    }
}
