import vm from 'node:vm'
import { parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { z } from 'zod'
import {
	BuildingDimensions,
	CustomInputLookupTable,
	CustomVariableLookupTable,
	PriceLookupTable,
	TakeOffApi,
	createContext,
	createDummyBuildingDimensions,
} from '#app/lib/takeoff'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

const CodeEditorSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	code: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const usedId = await requireUserId(request)

	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: CodeEditorSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { id, name, code } = submission.value

	let takeoffModel = await prisma.takeoffModel.findUnique({
		where: { id },
		include: {
			variables: true,
			inputs: true,
		},
	})

	if (!takeoffModel) {
		takeoffModel = await prisma.takeoffModel.create({
			data: {
				ownerId: usedId,
				name,
				code,
			},
			include: {
				variables: true,
				inputs: true,
			},
		})
	}

	const buildingDimensions = BuildingDimensions.fromObject(
		createDummyBuildingDimensions(),
	)
	const inputsLookupTable = new CustomInputLookupTable(takeoffModel.inputs)
	const variablesLookupTable = new CustomVariableLookupTable(
		takeoffModel.variables,
	)
	const prices = new PriceLookupTable([] as any)

	const takeoffApi = new TakeOffApi({
		id: takeoffModel.id,
		bd: buildingDimensions,
		prices,
		inputs: inputsLookupTable,
		variables: variablesLookupTable,
	})

	const vmContext = vm.createContext(createContext(takeoffApi))

	try {
		vm.runInContext(code, vmContext)
	} catch (error: Error | any) {
		return json({
			result: submission.reply({
				formErrors: [error.message],
			}),
		})
	}

	await prisma.takeoffModel.update({
		where: { id: takeoffModel.id },
		data: {
			name,
			code,
		},
	})

	return redirectWithToast(`/takeoff-models/${takeoffModel.id}/edit`, {
		title: 'Saved',
		type: 'success',
		description: `Your code has been saved.`,
	})
}
