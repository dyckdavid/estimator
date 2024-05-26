import vm from 'node:vm'
import { expect, test } from 'vitest'
import { prisma } from '#app/utils/db.server.js'
import { createBuildingDimensions, createUser } from '#tests/db-utils.js'
import { setupContext } from './context'

const pricelist = [
	{
		name: 'item1',
		pricePerUnit: 10,
		currency: 'USD',
		category: 'category1',
	},
	{
		name: 'item2',
		pricePerUnit: 20,
		currency: 'USD',
		category: 'category2',
	},
	{
		name: 'item3',
		pricePerUnit: 30,
		currency: 'USD',
		category: 'category3',
	},
]

test('The context works as expected', async () => {
	const user = await prisma.user.create({
		select: { id: true, username: true, name: true },
		data: { ...createUser() },
	})

	const customCalculation = await prisma.customCalculation.create({
		data: {
			name: 'Test Calculation',
			ownerId: user.id,
		},
		select: {
            cust
        }
	})

	const { context, errors, processJobQueue } = await setupContext({
		buildingDimensions: createBuildingDimensions(),
		pricelistData: pricelist,
		customCalculation,
		mode: 'dry-run',
	})

	console.log(errors)
	expect(errors).toEqual([])

	const fnRaw = `
        const testVariable = getVariable('testVariable', "2")
        const input = getUserInput('testInput', {
            label: 'Test Input',
            defaultValue: "1",
            type: 'number',
            description: 'Test Description',
            props: ""
        })
        const categoryItems = getCategoryItems('category1')
        const price = getPrice('item1')
    `

	const vmContext = vm.createContext(context)
	vm.runInContext(fnRaw, vmContext)

	await processJobQueue()

	const userInput = await prisma.customInputElement.findMany({
		where: {
			customCalculationId: customCalculation.id,
		},
	})

	console.log(userInput)
})
