import { type CustomInputElement } from '@prisma/client'
import { prisma } from '#app/utils/db.server.js'

export type CustomInputElementOptions = Pick<CustomInputElement, 'name' | 'label' | 'description' | 'defaultValue' | 'type' | 'props'>

export async function upsertCustomInput(
    customCalculationId: string,
    data: CustomInputElementOptions,
) {
    await prisma.customInputElement.upsert({
        where: {
            id: "__fake_id__",
            name: data.name,
            customCalculationId,
        },
        update: {
            ...data,
            props: JSON.stringify(data.props),
        },
        create: {
            ...data,
            props: JSON.stringify(data.props),
            customCalculationId,
        },
    })
}
