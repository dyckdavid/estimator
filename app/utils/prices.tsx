import { useEffect, useMemo, useState } from 'react'
import { useCalculationContext } from '#app/components/calclulation-block.js'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select.js'

export type Price = {
	key: string
	category: string
	options: {
		key: string
		price: number
	}[]
}

export type PriceMap = Map<string, Omit<Price, 'key'>>

export const prices: Price[] = [
	{
		key: '2x4x8',
		category: 'Lumber',
		options: [
			{ key: 'Grade 1', price: 2.5 },
			{ key: 'Grade 2', price: 2.0 },
			{ key: 'Grade 3', price: 1.5 },
		],
	},
]

interface UsePriceListProps {
	priceList: Price[]
}

export function usePriceList({ priceList }: UsePriceListProps) {
	const prices = useMemo(
		() => new Map(priceList.map(({ key, ...rest }) => [key, rest])),
		[priceList],
	)

	return {
		prices,
	}
}


interface PriceOptionsProps {
	onChange: (value: number) => void
	priceLookupKey: string
}

export function PriceOptions({
	onChange,
	priceLookupKey,
}: PriceOptionsProps) {
	const { prices } = useCalculationContext()

	const priceData = useMemo(
		() => prices.get(priceLookupKey),
		[prices, priceLookupKey],
	)

	const error = useMemo(() => {
		if (priceData === undefined) {
			return `Price not found for "${priceLookupKey}"`
		}
		return undefined
	}, [priceData, priceLookupKey])

	const [selectedOption, setSelectedOption] = useState(
		() => priceData?.options[0]?.key ?? '',
	)

	const onOptionChange = (option: string) => {
		setSelectedOption(option)
	}

	const options = useMemo(
		() => priceData?.options.map(option => option.key) || [],
		[priceData],
	)

	const unitPrice = useMemo(() => {
		return (
			priceData?.options.find(option => option.key === selectedOption)?.price ??
			NaN
		)
	}, [priceData, selectedOption])

	useEffect(() => {
		onChange(unitPrice)
	}, [unitPrice, onChange])

	if (error) {
		return <div>{error}</div>
	}

	if (options.length === 0) {
		return <div>{`No options found for "${priceLookupKey}"`}</div>
	}

	if (options.length === 1) {
		return null
	}

	return (
		<Select
			value={selectedOption}
			onValueChange={onOptionChange}
			defaultValue={selectedOption}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select Option" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{options.map(option => (
						<SelectItem key={option} value={option}>
							{option}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
}
