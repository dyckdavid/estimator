import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import BasicTable from '#app/components/basic-table.js'
import { Button } from '#app/components/ui/button.js'
import { TableCell, TableRow } from '#app/components/ui/table'
import { prisma } from '#app/utils/db.server.js'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import React from 'react'
import 'highlight.js/styles/a11y-dark.css'

export async function loader({ params }: LoaderFunctionArgs) {
	const takeoffModel = await prisma.takeoffModel.findFirst({
		where: {
			id: params.takeoffModelId,
		},
		include: {
			variables: true,
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
				<CardFooter className='flex justify-end'>
					<Button asChild>
						<Link to="code">Edit Code</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
