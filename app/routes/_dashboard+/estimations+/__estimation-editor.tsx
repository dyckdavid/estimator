import {
	FormId,
	FormProvider,
	getFieldsetProps,
	getFormProps,
	getInputProps,
	getTextareaProps,
	useForm,
	useFormMetadata,
	type FieldMetadata,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Estimation } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList, Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'
import { useIsPending } from '#app/utils/misc.tsx'
import { action } from './__estimation-editor.server'
import { EstimationEditLoader } from './$estimationId.edit'
import { BuildingDimensions } from '#app/lib/takeoff/building-dimensions.class.js'
import { BuildingDimensionsSchema, useBuildingDimensions } from '#app/hooks/used-building-dimensions.js'

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB

const ImageFieldsetSchema = z.object({
	id: z.string().optional(),
	file: z
		.instanceof(File)
		.optional()
		.refine(file => {
			return !file || file.size <= MAX_UPLOAD_SIZE
		}, 'File size must be less than 3MB'),
	altText: z.string().optional(),
})

export type ImageFieldset = z.infer<typeof ImageFieldsetSchema>


export const EstimationEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1).max(100),
	description: z.string().max(10000).optional(),
	images: z.array(ImageFieldsetSchema).max(5).optional(),
	dimensions: BuildingDimensionsSchema.optional(),
})

export function EstimationEditor({
	estimation,
	defaultValues,
}: {
	estimation?: EstimationEditLoader['estimation']
	// typeof estimation but with optional properties
	defaultValues?: Partial<EstimationEditLoader['estimation']>
}) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'estimation-editor',
		constraint: getZodConstraint(EstimationEditorSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: EstimationEditorSchema })
		},
		defaultValue: estimation || defaultValues,
	})

	const dimensions = fields.dimensions?.getFieldset()

	return (
		<FormProvider context={form.context}>
			<Form
				method="POST"
				className="flex h-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden px-10 pb-28 pt-12"
				{...getFormProps(form)}
				encType="multipart/form-data"
			>
				{estimation ? (
					<input type="hidden" name="id" value={estimation.id} />
				) : null}
				<Field
					labelProps={{ children: 'Title' }}
					inputProps={{ ...getInputProps(fields.title, { type: 'text' }) }}
					errors={fields.title.errors}
				/>
				<TextareaField
					labelProps={{ children: 'Content' }}
					textareaProps={{
						...getTextareaProps(fields.description),
					}}
					errors={fields.description.errors}
				/>
				<Field
					labelProps={{ children: 'Length' }}
					inputProps={{
						...getInputProps(dimensions.length, { type: 'number' }),
					}}
					errors={dimensions.length.errors}
				/>
				<Field
					labelProps={{ children: 'Width' }}
					inputProps={{
						...getInputProps(dimensions.width, { type: 'number' }),
					}}
					errors={dimensions.width.errors}
				/>
				<Field
					labelProps={{ children: 'Height' }}
					inputProps={{
						...getInputProps(dimensions.wallHeight, { type: 'number' }),
					}}
					errors={dimensions.wallHeight.errors}
				/>
				<Field
					labelProps={{ children: 'Total Interior Walls Length' }}
					inputProps={{
						...getInputProps(dimensions.totalInteriorWallsLength, {
							type: 'number',
						}),
					}}
					errors={dimensions.totalInteriorWallsLength.errors}
				/>
				<Field
					labelProps={{ children: 'Roof Pitch' }}
					inputProps={{
						...getInputProps(dimensions.roofRisePerFoot, { type: 'number' }),
					}}
					errors={dimensions.roofRisePerFoot.errors}
				/>
				<Field
					labelProps={{ children: 'Soffit Overhang Width' }}
					inputProps={{
						...getInputProps(dimensions.soffitOverhangWidth, {
							type: 'number',
						}),
					}}
					errors={dimensions.soffitOverhangWidth.errors}
				/>
				<div className="flex justify-end gap-4">
					<StatusButton
						form={form.id}
						type="submit"
						disabled={isPending}
						status={isPending ? 'pending' : 'idle'}
					>
						Calculate
					</StatusButton>
				</div>
			</Form>
            {/* <Calculator formId={form.id} /> */}
		</FormProvider>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}

export function Calculator({ formId }: { formId: FormId<z.infer<typeof EstimationEditorSchema>>}) {

    // const {buildingDimensions, error} = useBuildingDimensions(form.value?.dimensions)

    return (
        <div>

        </div>
    )
}
