import { parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { z } from 'zod'
import { requireUserId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { runAndSaveTakeoffModel } from '#app/utils/takeoff-model.server.js'
import {
	createToastHeaders,
	redirectWithToast,
} from '#app/utils/toast.server.js'

const CodeEditorSchema = z.object({
	id: z.string().optional(),
	code: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

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

	const { id, code } = submission.value

	let takeoffModel = await prisma.takeoffModel.findUnique({
		where: { id, ownerId: userId },
		include: {
			variables: true,
			inputs: true,
		},
	})

	if (!takeoffModel) {
		return redirectWithToast('/dashboard/takeoff-models', {
			description: 'Takeoff model not found',
			type: 'error',
		})
	}

	const { logs } = await runAndSaveTakeoffModel(takeoffModel, code, [] as any)

	return json(
		{
			result: submission.reply({
				formErrors: logs,
			}),
		},
		{
			headers: await createToastHeaders({
				description: 'Code saved successfully',
				type: 'success',
			}),
		},
	)
}
