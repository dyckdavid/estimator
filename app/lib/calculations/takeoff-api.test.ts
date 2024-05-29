import fs from 'node:fs'
import vm from 'node:vm'
import { expect, test } from 'vitest'
import { parseCSVFromFile } from '#app/utils/csv-parser.js'
import { prisma } from '#app/utils/db.server.js'
import { createUser } from '#tests/db-utils.js'
import { BuildingDimensions } from './building-dimensions.class'
import {
	CustomInputLookupTable,
	type TakeoffCustomInput,
} from './custom-user-input'
import {
	CustomVariableLookupTable,
	type TakeoffCustomVariable,
} from './custom-variables'
import { PriceLookupTable, PricelistSchema } from './pricelist.class'
import { TakeOffApi, saveTakeOffLookupHistories } from './takeoff-api'
import { createDummyBuildingDimensions } from './utils'
import { createContext } from './context'

async function setupTakeoffModel() {
	const user = await prisma.user.create({
		select: { id: true, username: true, name: true },
		data: { ...createUser() },
	})

	const takeoffModel = await prisma.takeoffModel.create({
		data: {
			name: 'Test Calculation',
			ownerId: user.id,
		},
	})

	return takeoffModel
}

async function getPricelistData() {
	const data = await parseCSVFromFile(__dirname + '/pricelist.csv', {
		deleteFile: false,
	})
	const pricelist = PricelistSchema.parse(data)
	return pricelist
}

test('Setting up TakeoffApi class', async () => {
	const takeoffModel = await setupTakeoffModel()
	const pricelist = await getPricelistData()
	const buildingDimensions = BuildingDimensions.fromObject(createDummyBuildingDimensions())
	const priceLookupTable = new PriceLookupTable(pricelist)

	const inputsLookupTable = new CustomInputLookupTable(
		[] as TakeoffCustomInput[],
	)

	const variablesLookupTable = new CustomVariableLookupTable(
		[] as TakeoffCustomVariable[],
	)

	const ctx = new TakeOffApi({
		id: takeoffModel.id,
		bd: buildingDimensions,
		prices: priceLookupTable,
		inputs: inputsLookupTable,
		variables: variablesLookupTable,
	})

	const code = fs.readFileSync(__dirname + '/calculations.js', 'utf-8')

	const vmContext = vm.createContext({
		...createContext(ctx)
	})
	vm.runInContext(code, vmContext)

    await saveTakeOffLookupHistories(ctx)

    const takeoffModelAfterSave = await prisma.takeoffModel.findUnique({
        where: { id: takeoffModel.id },
        include: { inputs: true, variables: true },
    })


    console.log(takeoffModelAfterSave);
})
