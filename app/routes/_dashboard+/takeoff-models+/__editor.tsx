import { Field, TextareaField } from '#app/components/forms.js'
import { Button } from '#app/components/ui/button.js'
import { Input } from '#app/components/ui/input.js'
import { Label } from '#app/components/ui/label.js'
import { Textarea } from '#app/components/ui/textarea'
import { Form, useActionData } from '@remix-run/react'
import { action } from './__editor.server'
import {
	getFormProps,
	getInputProps,
	useForm,
	getTextareaProps,
} from '@conform-to/react'

export type ModelCodeEditorProps = {
	model?: {
		id: string
		code: string
	}
}

export function ModelCodeEditor({ model }: ModelCodeEditorProps) {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: 'model-editor',
		lastResult: actionData?.result,
		defaultValue: model,
	})

	return (
		<Form method="post" {...getFormProps(form)}>
			{model && <input type="hidden" name="id" value={model.id} />}
			<TextareaField
				labelProps={{ children: 'Content' }}
				textareaProps={{
                    rows: 20,
					...getTextareaProps(fields.code),
				}}
				errors={fields.code.errors}
			/>
			<div id={form.errorId}
            className='text-red-500'
            >{form.errors}</div>
			<Button>Save</Button>
		</Form>
	)
}
