import {
	type ActionFunction,
	json,
	unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/node'
import { parseCSVFromFile } from '#app/utils/csv-parser.js'
import {
	csvUploadHandler,
	isUploadedFile,
} from '#app/utils/csv-upload-handler.js'
import { useFetcher } from '@remix-run/react'
import { Input } from '#app/components/ui/input.js'
import { CSVTable } from '#app/components/csv-table.js'
import {
	Pricelist,
	PricelistSchema,
} from '#app/lib/calculations/pricelist.class.js'
import { prisma } from '#app/utils/db.server.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { Button } from '#app/components/ui/button.js'
import { useEffect } from 'react'

export const loader: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request)
	const pricelists = await prisma.pricelist.findMany({
		where: {
			ownerId: userId,
		},
		include: {
			items: true,
		},
	})

	return json(pricelists)
}

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request)
	const formData = await parseMultipartFormData(request, csvUploadHandler)

	const file = formData.get('pricelist')

	if (!isUploadedFile(file)) return null

	console.log(formData.get('pricelist'))

	const pricelistFromCSV = await parseCSVFromFile(file.getFilePath())

	const pricelistData = PricelistSchema.parse(pricelistFromCSV)

	const newPricelist = await prisma.pricelist.create({
		data: {
			ownerId: userId,
			name: file.name,
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

	return json({
		name: newPricelist.name,
		id: newPricelist.id,
		items: pricelistData,
	})
}

export default function UploadPricelist() {
	const pricelist = useFetcher<typeof loader>()

	useEffect(() => {
		if (!pricelist.data) {
			pricelist.load('/resources/upload-pricelist')
		}
	}, [])

	return (
		<div>
			<div className="flex">
				<pricelist.Form
					method="post"
					encType="multipart/form-data"
					action="/resources/upload-pricelist"
				>
					<Input
						type="file"
						name="pricelist"
						onChange={e => {
							console.log(e.target.files)
							// check if there is a file
							if (!e.target.files) return

							// get form
							const form = e.target.form
							pricelist.submit(form)
						}}
					/>
					<input type="hidden" name="intent" value="upload-pricelist" />
				</pricelist.Form>
				<pricelist.Form method="delete" action="/resources/upload-pricelist">
					<Button type="submit" variant="destructive">
						Delete
					</Button>
				</pricelist.Form>
			</div>
			{pricelist.data?.items ? (
				<CSVTable data={pricelist.data.items as any} />
			) : null}
		</div>
	)
}
