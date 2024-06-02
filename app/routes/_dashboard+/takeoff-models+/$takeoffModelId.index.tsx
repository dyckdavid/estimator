import { invariant, invariantResponse } from '@epic-web/invariant'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import {
	type LoaderFunctionArgs,
	json,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import React from 'react'
import BasicTable from '#app/components/basic-table.js'
import { Button } from '#app/components/ui/button.js'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { TableCell, TableRow } from '#app/components/ui/table'
import { prisma } from '#app/utils/db.server.js'
import 'highlight.js/styles/a11y-dark.css'
import { useDelayedIsPending } from '#app/utils/misc.js'
import { useSpinDelay } from 'spin-delay'
import { Icon } from '#app/components/ui/icon.js'
import { Check, LoaderCircle } from 'lucide-react'

export async function loader({ params }: LoaderFunctionArgs) {
	const takeoffModel = await prisma.takeoffModel.findFirst({
		where: {
			id: params.takeoffModelId,
		},
		include: {
			variables: true,
			inputs: {
				orderBy: {
					order: 'asc',
				},
			},
		},
	})

	invariantResponse(takeoffModel, 'Not found', { status: 404 })
	hljs.registerLanguage('javascript', javascript)
	const code = hljs.highlight(takeoffModel.code, {
		language: 'javascript',
	}).value

	return json({
		takeoffModel: {
			...takeoffModel,
			code,
		},
	})
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')
	const takeoffModelId = params.takeoffModelId

	invariantResponse(takeoffModelId, 'Not found', { status: 404 })

	switch (intent) {
		case 'update-inputs-order':
			return updateInputsOrder(takeoffModelId, formData)
	}

	return null
}

export default function TakeoffModelIndex() {
	const data = useLoaderData<typeof loader>()

	return (
		<div className="space-y-4">
			<BasicTable
				title="Variables"
				headers={['Name', 'Value']}
				description="A list of variables in the takeoff model."
				actionButton={
					<Button asChild>
						<Link to={'new'}>New Variable</Link>
					</Button>
				}
			>
				{data.takeoffModel.variables.map(variable => (
					<TableRow key={variable.id}>
						<TableCell>
							<Link to={variable.id} className="hover:underline">
								{variable.name}
							</Link>
						</TableCell>
						<TableCell>{variable.value}</TableCell>
					</TableRow>
				))}
			</BasicTable>
			<SortInputs />
			<Card>
				<CardHeader>
					<CardTitle>Code</CardTitle>
					<CardDescription>
						This is the code responsible for the takeoff.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<pre>
						<code
							className="language-javascript"
							dangerouslySetInnerHTML={{ __html: data.takeoffModel.code }}
						/>
					</pre>
				</CardContent>
				<CardFooter className="flex justify-end">
					<Button asChild>
						<Link to="code">Edit Code</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}

async function updateInputsOrder(takeoffModelId: string, formData: FormData) {
	const inputs = formData.getAll('inputs[]') as string[]
	await prisma.takeoffModel.update({
		where: { id: takeoffModelId },
		data: {
			inputs: {
				updateMany: inputs.map((name, index) => ({
					where: { name },
					data: { order: index },
				})),
			},
		},
	})

	return null
}

export function SortInputs() {
	const inputs = useLoaderData<typeof loader>().takeoffModel.inputs
	const fetcher = useFetcher()
	const isSaving = useSpinDelay(fetcher.state === 'submitting', {
		minDuration: 300,
		delay: 0,
	})
	const [parent, items] = useDragAndDrop<HTMLDivElement, string>(
		inputs.map(input => input.name),
		{
			handleEnd: data => {
				const form = data.targetData.parent.el.parentElement as HTMLFormElement
				invariant(form, 'Form not found')
				fetcher.submit(form, {
					method: 'post',
				})
			},
		},
	)

	return (
		<Card>
			<CardHeader className="mt-0 flex flex-row items-start space-y-0">
				<div className="grid gap-2">
					<CardTitle>Inputs</CardTitle>
					<CardDescription>
						Reorder the inputs to change the order in which they appear in the
						takeoff.
					</CardDescription>
				</div>
				<div className="ml-auto text-foreground/60">
					{isSaving ? <LoaderCircle className="animate-spin" /> : <Check />}
				</div>
			</CardHeader>
			<CardContent>
				<fetcher.Form method="post">
					<input type="hidden" name="intent" value="update-inputs-order" />
					<div ref={parent} className="space-y-3">
						{items.map((item, index) => (
							<div
								className="cursor-grab rounded border p-4"
								data-label={item}
								key={item}
							>
								<input type="hidden" name="inputs[]" value={item} />
								{item}
							</div>
						))}
					</div>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}
