import { invariantResponse } from '@epic-web/invariant'
import {
	type SerializeFrom,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { BuildingDimensions } from '#app/lib/calculations/building-dimensions.class.js'
import { useBuildingDimensions } from '#app/hooks/used-building-dimensions.js'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'
import { getCalculations } from './__calculations'
import { PriceLookupTable } from '#app/lib/calculations/pricelist.class'
import { PartWithPrice } from '#app/lib/calculations/assembly.class'
import React from 'react'
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from '#app/components/ui/tabs'
import { Button } from '#app/components/ui/button'

export const handle = {
	breadcrumb: 'Calculate',
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const estimation = await prisma.estimation.findFirst({
		include: {
			dimensions: {
                select: {
                    width: true,
                    wallHeight: true,
                    length: true,
                    totalInteriorWallsLength: true,
                    roofRisePerFoot: true,
                    soffitOverhangWidth: true,
                }
            }
		},
		where: {
			id: params.estimationId,
			ownerId: userId,
		},
	})

	invariantResponse(estimation, 'Not found', { status: 404 })

	const dimensions = estimation.dimensions

	invariantResponse(dimensions, 'Not found', { status: 404 })

	const pricelist = await prisma.pricelist.findFirst({
		include: {
			items: true,
		},
		where: {
			ownerId: userId,
		},
		orderBy: {
			updatedAt: 'desc',
		},
	})

	invariantResponse(pricelist, 'Not found', { status: 404 })

	const buildingDimensions = new BuildingDimensions(
		dimensions.width,
		dimensions.wallHeight,
		dimensions.length,
		dimensions.totalInteriorWallsLength,
		dimensions.roofRisePerFoot,
		dimensions.soffitOverhangWidth,
	)

	const calculationResults = getCalculations().map(calculation => {
		return calculation
			.build(buildingDimensions)
			.resolvePrices(new PriceLookupTable(pricelist.items))
			.serialize()
	})

	return json({
		calculationResults,
		estimation,
	})
}

export type CalculationDataLoader = SerializeFrom<typeof loader>

export default function CalculationResults() {
	const data = useLoaderData<typeof loader>()

	return (
		<>
			<div className='flex justify-end'>
				<Button asChild >
					<Link to={`/estimations/${data.estimation.id}/edit`}>Edit</Link>
				</Button>
			</div>
			<Tabs defaultValue="sections" className="mt-8">
				<TabsList>
					<TabsTrigger value="sections">Sections</TabsTrigger>
					<TabsTrigger value="concise">Concise</TabsTrigger>
				</TabsList>
				<TabsContent value="sections">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Material</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Price Per Unit</TableHead>
								<TableHead className="text-right">Total Price</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.calculationResults.map(calculation => (
								<React.Fragment key={calculation.name}>
									<TableRow>
										<TableCell colSpan={4} className="text-bold bg-muted/50">
											{calculation.name}
										</TableCell>
									</TableRow>
									{calculation.parts.map(part => (
										<CalculationBlockDisplay
											key={part.priceLookupKey}
											part={part}
										/>
									))}
								</React.Fragment>
							))}
						</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell colSpan={3}>Total</TableCell>
								<TableCell className="text-right">
									{data.calculationResults
										.reduce((total, calculation) => {
											return (
												total +
												calculation.parts.reduce((total, part) => {
													return total + part.price.value * part.qty
												}, 0)
											)
										}, 0)
										.toLocaleString('en-US', {
											style: 'currency',
											currency: 'USD',
										})}
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</TabsContent>
				<TabsContent value="concise">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Material</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Price Per Unit</TableHead>
								<TableHead>Total Price</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.calculationResults
								.reduce((acc, calculation) => {
									return acc.concat(calculation.parts)
								}, [] as PartWithPrice[])
								.reduce((acc, part) => {
									const existingPart = acc.find(
										p => p.priceLookupKey === part.priceLookupKey,
									)

									if (existingPart) {
										existingPart.qty += part.qty
									} else {
										acc.push({ ...part })
									}

									return acc
								}, [] as PartWithPrice[])
								.map(part => (
									<CalculationBlockDisplay
										key={part.priceLookupKey}
										part={part}
									/>
								))}
						</TableBody>
						<TableFooter>
							<TableRow>
								<TableCell colSpan={3}>Total</TableCell>
								<TableCell className="text-right">
									{data.calculationResults
										.reduce((total, calculation) => {
											return (
												total +
												calculation.parts.reduce((total, part) => {
													return total + part.price.value * part.qty
												}, 0)
											)
										}, 0)
										.toLocaleString('en-US', {
											style: 'currency',
											currency: 'USD',
										})}
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</TabsContent>
			</Tabs>
		</>
	)
}

interface CalculationBlockDisplayProps {
	part: PartWithPrice
}

function CalculationBlockDisplay({ part }: CalculationBlockDisplayProps) {
	const hasPrice = part.price.value !== null
	const pricePerUnit = hasPrice
		? part.price.value.toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD',
			})
		: `No price found for ${part.priceLookupKey}`

	const totalPrice = hasPrice
		? (part.price.value * part.qty).toLocaleString('en-US', {
				style: 'currency',
				currency: 'USD',
			})
		: ' - '

	return (
		<TableRow>
			<TableCell>{part.priceLookupKey}</TableCell>
			<TableCell>{part.qty}</TableCell>
			<TableCell>{pricePerUnit}</TableCell>
			<TableCell className="text-right">{totalPrice}</TableCell>
		</TableRow>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}
