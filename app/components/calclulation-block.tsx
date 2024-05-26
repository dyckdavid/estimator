import { useEffect, useReducer, useState } from 'react'
import { useBuildingDimensions } from '#app/hooks/used-building-dimensions.js'
import { type CalculationDataLoader } from '#app/routes/_dashboard+/estimations+/$estimationId_.calculate.js'
import { type BuildingDimensions } from '#app/lib/calculations/building-dimensions.class.js'
import { createSafeContext } from '#app/utils/create-safe-context.js'
import {
	usePriceList,
	PriceOptions,
	usePriceOptions,
	type PriceMap,
} from '#app/utils/prices.js'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from './ui/table'

interface CalculationContextData {
	bd: BuildingDimensions
	prices: PriceMap
	updateTotal: React.Dispatch<{
		index: number
		amount: number
	}>
}

const [CalculationsProvider, useCalculationContext] =
	createSafeContext<CalculationContextData>('CalculationContext not found')

export { useCalculationContext }

interface CalculationProviderProps {
	children: React.ReactNode
	data: CalculationDataLoader
}

export function CalculationsTable({
	children,
	data,
}: CalculationProviderProps) {
	const bd = useBuildingDimensions(data.estimation.dimensions)
	const { prices } = usePriceList({ priceList: data.prices })
	const [totals, updateTotal] = useReducer(
		(values: number[], action: { index: number; amount: number }) => {
			const newValues = [...values]
            newValues[action.index] = action.amount
            return newValues
		},
		[],
	)
    const total = totals.filter(Boolean).reduce((prev, curr) => prev + curr, 0)

	return (
		<CalculationsProvider
			value={{
				bd,
				prices,
				updateTotal,
			}}
		>
			<Table>
				<TableCaption>Calculated values</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Total</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>{children}</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={3}>Total</TableCell>
						<TableCell>$ {total}</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</CalculationsProvider>
	)
}

export interface CalculationBlockProps {
	name: string
    index: number
	units: number | ((ctx: CalculationContextData) => number)
	priceLookupKey: string
}

export function CalculationBlock({
	name,
	units: _units,
    index,
	priceLookupKey,
}: CalculationBlockProps) {
    const [unitPrice, setUnitPrice] = useState(NaN)
	const ctx = useCalculationContext()
	const units = typeof _units === 'function' ? _units(ctx) : _units
	const total = unitPrice * units

	useEffect(() => {
		if (isNaN(total)) return
        console.log('updateTotal', { index, amount: total })

		ctx.updateTotal({ index, amount: total })
	}, [total])

	return (
		<TableRow>
			<TableCell>{name}</TableCell>
			<TableCell>{units}</TableCell>
			<TableCell>
				<PriceOptions priceLookupKey={priceLookupKey} onChange={setUnitPrice}/>
			</TableCell>
			<TableCell>{isNaN(total) ? ' - ' : `$ ${total}`}</TableCell>
		</TableRow>
	)
}
