import { createContext } from './context'

const {
	createSection,
	getUserInput,
	getVariable,
	getCount,
	getCategoryItems,
	insertHeading,
	BuildingDimensions,
} = createContext({} as any)

const wallHeight = getVariable('wallHeight', 8)
const studsPerFoot = getVariable('studsPerFoot', 1)
const floorThickness = getVariable('floorThickness', 1)
const roofRisePerFoot = getVariable('roofRisePerFoot', 1)
const soffitOverhangWidth = getVariable('soffitOverhangWidth', 1)

insertHeading('House Dimensions', 'Enter the dimensions of the house')

const width = getUserInput('width', 20)
const length = getUserInput('length', 50)
const totalInteriorWallsLength = getUserInput('interiorWallLength', 100)

const bd = new BuildingDimensions({
	width,
	length,
	wallHeight,
	floorThickness,
	totalInteriorWallsLength,
	roofRisePerFoot,
	soffitOverhangWidth,
})

const lumberSection = createSection('Lumber')

lumberSection.addPart({
	name: 'Studs',
	qty: studsPerFoot * bd.exteriorWallsLinearFeet + bd.interiorWallsLinearFeet,
	priceLookupKey: '2x4x8',
})

lumberSection.addPart({
	name: 'Sheathing',
	qty: Math.ceil(bd.floorSurfaceArea / 32),
	priceLookupKey: '7/16" OSB',
})

insertHeading('Bathroom Fixtures', 'Select the number of each item you need')

const plumbingSection = createSection('Plumbing')
const bathroomItems = getCategoryItems('bathroom').slice(0, 5)
for (const item of bathroomItems) {
	plumbingSection.addPart({
		name: item.name,
		qty: getCount(item.name),
		priceLookupKey: item.name,
	})
}
