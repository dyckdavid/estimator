import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '#app/utils/auth.server.js'
import { EstimationEditor } from './__estimation-editor'
import { useLoaderData } from '@remix-run/react'
import { EstimationEditLoader } from './$estimationId_.edit'
import { prisma } from '#app/utils/db.server.js'

export { action } from './__estimation-editor.server'

export const handle = {
	breadcrumb: 'New Estimation',
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

    // We want to use the title 'New Estimation' as the default value for the title field but incrementing it with a number if it already exists
    // We can do this by querying the database for estimations with the title 'New Estimation' and then incrementing the number
    // If there are no estimations with the title 'New Estimation', we can use the title as is

    const titles = await prisma.estimation.findMany({
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

	const newEstimation = {
		title,
		dimensions: {
			width: 25,
			length: 50,
			wallHeight: 10,
			totalInteriorWallsLength: 100,
			roofRisePerFoot: 5,
			soffitOverhangWidth: 2,
		},
	}
	return json({newEstimation})
}

export default function NewEstimation() {
    const data = useLoaderData<typeof loader>()

    return <EstimationEditor defaultValues={data.newEstimation} />
}
