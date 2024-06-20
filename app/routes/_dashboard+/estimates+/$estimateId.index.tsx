import { type LoaderFunctionArgs, json, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import * as ccase from 'change-case'
import { DollarSign } from 'lucide-react'
import React from 'react'
import _ from 'underscore'
import { DynamicTable } from '#app/components/dynamic-table.js'
import { Button } from '#app/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from '#app/components/ui/tabs'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { nameTheThing } from '#app/utils/naming.server.js'

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
		const name = await nameTheThing(userId, 'New Estimate', 'estimate')
		const takeoffModel = await prisma.takeoffModel.findFirst({
			select: {
				id: true,
			},
			where: {
				ownerId: userId,
			},
			orderBy: {
				updatedAt: 'desc',
			},
		})

		const pricelists = await prisma.pricelist.findMany({
			select: {
				id: true,
			},
			where: {
				ownerId: userId,
			},
		})

		const newEstimate = await prisma.estimate.create({
			data: {
				ownerId: userId,
				name,
				status: 'draft',
				takeoffModelId: takeoffModel?.id,
				prices: {
					connect: pricelists.map(pricelist => ({ id: pricelist.id })),
				},
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
							<CardTitle>{data.estimate.name}</CardTitle>
							<CardDescription>
								This estimate is empty. Please add some items to it.
							</CardDescription>
						</div>
						<Button asChild className="ml-auto text-nowrap">
							<Link to="edit">Add Items</Link>
						</Button>
					</CardHeader>
				</Card>
			</div>
		)
	}

	return (
		<div className="main-container">
			<Card className="">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Cost</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{data.estimate.results
							.reduce((acc, part) => acc + part.total, 0)
							.toLocaleString('en-US', {
								style: 'currency',
								currency: 'USD',
							})}
					</div>
					<p className="text-xs text-muted-foreground"></p>
				</CardContent>
			</Card>
			<Tabs defaultValue="detail" className="mt-8">
				<div className="flex">
					<TabsList>
						<TabsTrigger value="detail">Sections</TabsTrigger>
						<TabsTrigger value="materials">Materials</TabsTrigger>
					</TabsList>
					<Button asChild className="ml-auto">
						<Link to="edit">Edit</Link>
					</Button>
				</div>
				<TabsContent value="detail">
					{_.pairs(_.groupBy(data.estimate.results, 'section')).map(
						([sectionName, parts]) => (
							<SectionCard key={sectionName} name={sectionName}>
								<DynamicTable
									data={parts}
									labelFormatter={ccase.capitalCase}
									columns={
										[
											'name',
											'qty',
											{
												key: 'pricePerUnit',
												className: 'max-sm:hidden text-right',
												format: value =>
													value.toLocaleString('en-US', {
														style: 'currency',
														currency: 'USD',
													}),
											},
											{
												key: 'total',
												className: 'text-right',
												format: value =>
													value.toLocaleString('en-US', {
														style: 'currency',
														currency: 'USD',
													}),
											},
										] as const
									}
								/>
							</SectionCard>
						),
					)}
				</TabsContent>
				<TabsContent value="materials">
					<SectionCard name="Materials">
						<DynamicTable
							data={data.estimate.results}
							labelFormatter={ccase.capitalCase}
							columns={
								[
									'priceLookupKey',
									'qty',
									{
										key: 'pricePerUnit',
										className: 'max-sm:hidden text-right',
										format: value =>
											value.toLocaleString('en-US', {
												style: 'currency',
												currency: 'USD',
											}),
									},
									{
										key: 'total',
										className: 'text-right',
										format: value =>
											value.toLocaleString('en-US', {
												style: 'currency',
												currency: 'USD',
											}),
									},
								] as const
							}
						/>
					</SectionCard>
				</TabsContent>
			</Tabs>
		</div>
	)
}

function SectionCard({
	name,
	children,
}: {
	name: string
	children: React.ReactNode
}) {
	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle>{name}</CardTitle>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	)
}
