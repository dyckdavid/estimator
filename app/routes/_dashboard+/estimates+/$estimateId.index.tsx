import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import _ from 'underscore'
import { LoaderFunctionArgs, json, redirect } from '@remix-run/node'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'
import React from 'react'
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from '#app/components/ui/tabs'
import { CalculatedItem } from '#app/lib/takeoff/takeoff-api.js'
import { Link, useLoaderData } from '@remix-run/react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { Button } from '#app/components/ui/button'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const estimate = await prisma.estimate.findFirst({
		where: {
			id: params.estimateId,
			ownerId: userId,
		},
		include: {
			results: true,
		},
	})

	if (!estimate) {
		const titles = await prisma.estimate.findMany({
			where: {
				title: {
					contains: 'New Estimation',
				},
			},
			select: {
				title: true,
			},
		})

		let title = 'New Estimation'
		if (titles.length > 0) {
			const titleNumbers = titles.map(({ title }) => {
				const number = parseInt(title.replace('New Estimation ', ''))
				return isNaN(number) ? 0 : number
			})
			const maxNumber = Math.max(...titleNumbers)
			title = `New Estimation ${maxNumber + 1}`
		}

		const newEstimate = await prisma.estimate.create({
			data: {
				ownerId: userId,
				title,
				status: 'draft',
			},
		})

		return redirect(`/estimates/${newEstimate.id}/edit`)
	}

	return json({ estimate })
}

export default function Estimate() {
	const data = useLoaderData<typeof loader>()

	if (data.estimate.results.length === 0) {
		return (
			<div className="main-container">
				<Card>
					<CardHeader className="flex flex-row items-center">
						<div className="grid gap-2">
							<CardTitle>{data.estimate.title}</CardTitle>
							<CardDescription>
								This estimate is empty. Please add some items to it.
							</CardDescription>
						</div>
						<Button asChild className="ml-auto">
							<Link to="edit">Add Items</Link>
						</Button>
					</CardHeader>
				</Card>
			</div>
		)
	}

	return (
		<div className="main-container">
			<Tabs defaultValue="detail" className="mt-8">
				<div className="flex">
					<TabsList>
						<TabsTrigger value="detail">Sections</TabsTrigger>
						<TabsTrigger value="materials">Concise</TabsTrigger>
					</TabsList>
					<Button asChild className="ml-auto">
						<Link to="edit">Edit</Link>
					</Button>
				</div>
				<TabsContent value="detail">
					{_.pairs(_.groupBy(data.estimate.results, 'section')).map(
						([sectionName, parts]) => (
							<EstimateSectionTable
								key={sectionName}
								section={{ name: sectionName, parts }}
							/>
						),
					)}
				</TabsContent>
				<TabsContent value="materials">
					<EstimateSectionTable
						section={{ name: 'All', parts: data.estimate.results }}
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}

type EstimateSectionTableProps = {
	section: {
		name: string
		parts: CalculatedItem[]
	}
}

function EstimateSectionTable({ section }: EstimateSectionTableProps) {
	return (
		<Card className="">
			<CardHeader className="flex flex-row items-center">
				{section.name}
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Item</TableHead>
							<TableHead>Material</TableHead>
							<TableHead>Quantity</TableHead>
							<TableHead className="text-right">Price Per Unit</TableHead>
							<TableHead className="text-right">Total Price</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{section.parts.map(part => (
							<CalculatedItemRow key={part.name} part={part} />
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}

type CalculatedItemRowProps = {
	part: CalculatedItem
}

function CalculatedItemRow({ part }: CalculatedItemRowProps) {
	return (
		<TableRow>
			<TableCell>{part.name}</TableCell>
			<TableCell>{part.priceLookupKey}</TableCell>
			<TableCell>{part.qty}</TableCell>
			<TableCell className="text-right">
				{part.pricePerUnit.toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
				})}
			</TableCell>
			<TableCell className="text-right">
				{part.total.toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
				})}
			</TableCell>
		</TableRow>
	)
}
