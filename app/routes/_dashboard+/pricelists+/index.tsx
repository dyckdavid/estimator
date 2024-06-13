import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	unstable_parseMultipartFormData as parseMultipartFormData,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
} from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { Badge } from '#app/components/ui/badge.js'
import { Button } from '#app/components/ui/button.js'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#app/components/ui/dialog'
import { Icon } from '#app/components/ui/icon.js'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'
import { PricelistSchema } from '#app/lib/takeoff/pricelist.class.js'
import { SharingDialog } from '#app/routes/resources+/sharing+/$entityType.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { parseCSVFromFile } from '#app/utils/csv-parser.js'
import {
	csvUploadHandler,
	isUploadedFile,
} from '#app/utils/csv-upload-handler.js'
import { prisma } from '#app/utils/db.server'
import { formatListTimeAgo } from '#app/utils/misc.js'
import { requireUserWithPermission } from '#app/utils/permissions.server.js'
import { Users } from 'lucide-react'

const PricelistSchema = z.object({
    id: z.string(),
    name: z.string(),
    supplier: z.string(),
    updatedAt: z.date(),
    createdAt: z.date(),
    isShared: z.coerce.string().transform(value => value === '1'),
    accessLevels: z.string().nullish(),
})

const PricesQueryResultsSchema = z.array(PricelistSchema)

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const rawPrices = await prisma.$queryRaw`
        SELECT p.*,
               CASE
                   WHEN c.entityId IS NOT NULL THEN 1
                   ELSE 0
               END AS isShared,
               GROUP_CONCAT(c.action) AS accessLevels
        FROM pricelist p
        LEFT JOIN collaboration c ON p.id = c.entityId AND c.userId = ${userId} AND c.entity = 'pricelist'
        WHERE p.ownerId = ${userId} OR p.id IN (
            SELECT entityId
            FROM collaboration
            WHERE userId = ${userId} AND entity = 'pricelist'
        )
        GROUP BY p.id
        ORDER BY p.updatedAt DESC;
    `

	const pricelists = PricesQueryResultsSchema.parse(rawPrices)

	invariantResponse(pricelists, 'Not found', { status: 404 })

	return json({ pricelists: formatListTimeAgo(pricelists) })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await parseMultipartFormData(request, csvUploadHandler)
	// const formData = await request.formData()
	const intent = formData.get('intent')

	switch (intent) {
		case 'delete':
			return handlePricelistDelete(request, userId, formData)
		case 'upload':
			return handleCSVUpload(userId, formData)
		default:
			return null
	}
}

export default function Pricelists() {
	const data = useLoaderData<typeof loader>()

    function canShare(pricelist: typeof data.pricelists[0]) {
        return pricelist.accessLevels === null ? true : pricelist.accessLevels?.includes('write')
    }

	return (
		<div className="main-container">
			<div className="main-container">
			</div>
			<Card>
				<CardHeader className="flex flex-row items-center">
					<div className="grid gap-2">
						<CardTitle>Pricelists</CardTitle>
						<CardDescription>A list of your pricelists.</CardDescription>
					</div>
					<div className="ml-auto">
						<CSVUploadDialog />
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead className="hidden md:table-cell">Supplier</TableHead>
								<TableHead>Last Updated</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.pricelists.map(pricelist => (
								<TableRow key={pricelist.id}>
									<TableCell className="flex items-start gap-4 font-medium">
										<Link to={pricelist.id} className="hover:underline">
											{pricelist.name}
										</Link>
										{pricelist.isShared && (
											<Users size={18} />
										)}
									</TableCell>
									<TableCell className="hidden md:table-cell">
										{pricelist.supplier}
									</TableCell>
									<TableCell>{pricelist.updatedAt} ago</TableCell>
									<TableCell className="flex">
										<SharingDialog
											entityId={pricelist.id}
											entityType="pricelist"
											disabled={!canShare(pricelist)}
										/>
										<Form method="post" action={`${pricelist.id}/delete`}>
											<Button
												type="submit"
												variant="ghost"
												disabled={pricelist.isShared}
											>
												<Icon name="trash" />
											</Button>
										</Form>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}

async function handleCSVUpload(userId: string, formData: FormData) {
	const file = formData.get('pricelist')
	const name = formData.get('name') as string
	const supplier = formData.get('supplier') as string

	if (!isUploadedFile(file)) return null

	const pricelistFromCSV = await parseCSVFromFile(file.getFilePath())

	const result = PricelistSchema.safeParse(pricelistFromCSV)

	if (!result.success) {
		return json({ error: result.error }, { status: 400 })
	}

	const pricelistData = result.data

	const newPricelist = await prisma.pricelist.create({
		data: {
			ownerId: userId,
			name,
			supplier,
		},
	})

	pricelistData.forEach(async item => {
		await prisma.pricelistItem.create({
			data: {
				pricelistId: newPricelist.id,
				category: item.category,
				name: item.name,
				pricePerUnit: item.pricePerUnit,
				unitType: item.unitType,
				currency: item.currency,
			},
		})
	})

	return redirect(`/pricelists/${newPricelist.id}`)
}

function CSVUploadDialog() {
	const actionData = useActionData<typeof action>()

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Upload Pricelist</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Upload Pricelist</DialogTitle>
					<DialogDescription>
						Upload a new pricelist to add to your collection. Must be in CSV
						format.
						<br />
						Here are the columns that are required:
						<ul className="list-inside list-disc">
							<li>Category</li>
							<li>Name</li>
							<li>Unit Type</li>
							<li>Price Per Unit</li>
							<li>Currency</li>
						</ul>
					</DialogDescription>
					<pre className="text-red-500">{actionData?.error?.message}</pre>
				</DialogHeader>
				<Form method="post" encType="multipart/form-data">
					<input type="hidden" name="intent" value="upload" />
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name">Name</Label>
							<Input type="text" name="name" required className="col-span-3" />
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="supplier">Supplier</Label>
							<Input type="text" name="supplier" className="col-span-3" />
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="pricelist">CSV File</Label>
						<Input
							type="file"
							name="pricelist"
							className="col-span-3 cursor-pointer"
							accept=".csv"
							required
						/>
					</div>
					<DialogFooter className="mt-4">
						<Button type="submit">Upload</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

async function handlePricelistDelete(
	request: Request,
	userId: string,
	formData: FormData,
) {
	const id = formData.get('id') as string

	const pricelist = await prisma.pricelist.findFirst({
		where: {
			id: id,
		},
	})

	invariantResponse(pricelist, 'Not found', { status: 404 })

	const isOwner = pricelist.ownerId === userId
	await requireUserWithPermission(
		request,
		isOwner ? `delete:pricelist:own` : `delete:pricelist:any`,
	)

	await prisma.pricelist.delete({
		where: {
			id: id,
		},
	})

	return null
}
