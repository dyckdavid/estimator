import { z } from "zod"

export const PricelistItemSchema = z.object({
    name: z.string(),
    pricePerUnit: z.coerce.number(),
    currency: z.string(),
    category: z.string(),
})

export type PricelistItem = z.infer<typeof PricelistItemSchema>

export const PricelistSchema = z.array(PricelistItemSchema)

export type Price = {
    value: number,
    currency: string,
}

export class PriceLookupTable {
	private table: Map<string, PricelistItem> = new Map()

	constructor(pricelist: PricelistItem[]) {
		pricelist.forEach(item => {
			this.table.set(item.name, item)
		})
	}

	getPrice(name: string) {
		const item = this.table.get(name)
		if (!item) {
			return {
                value: NaN,
                currency: '',
            }
		}

		return {
			value: item.pricePerUnit,
			currency: item.currency,
		}
	}

    hasCategory(category: string) {
        return Array.from(this.table.values()).some(item => item.category === category)
    }

    getCategoryItems(category: string) {
        return Array.from(this.table.values()).filter(item => item.category === category)
    }
}
