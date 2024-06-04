import {
	json,
	unstable_parseMultipartFormData as parseMultipartFormData,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
} from '@remix-run/node'
import { Input } from '#app/components/ui/input'
import { PricelistSchema } from '#app/lib/takeoff/pricelist.class.js'
import { requireUserId } from '#app/utils/auth.server.js'
import { parseCSVFromFile } from '#app/utils/csv-parser.js'
import {
	csvUploadHandler,
	isUploadedFile,
} from '#app/utils/csv-upload-handler.js'
import { prisma } from '#app/utils/db.server'

export const handle = {
	breadcrumb: 'New',
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await parseMultipartFormData(request, csvUploadHandler)
	const file = formData.get('pricelist')

	if (!isUploadedFile(file)) return null

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

	return redirect(`/pricelists/${newPricelist.id}`)
}

export default function UploadPricelist() {
	return (
		<div className="main-container w-fit h-fit flex flex-col gap-4 rounded-lg border border-gray-300 border-dashed px-4 pt-8 pb-4">
			<p>Upload a CSV file with the pricelist data.</p>
			<form method="post" encType="multipart/form-data">
				<Input
					type="file"
					name="pricelist"
					onChange={e => {
						// check if there is a file
						if (!e.target.files) return

						const form = e.target.form
						form?.submit()
					}}
				/>
			</form>
		</div>
	)
}
