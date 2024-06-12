import { createContext } from './context'

const { createSection, getUserInput, getVariable } = createContext({} as any)

const width = getUserInput('width', 25)
const length = getUserInput('length', 50)
const interiorWallLength = getUserInput('interiorWallLength', 100)
const studsPerFoot = getVariable('studsPerFoot', 1)

const floorArea = width * length
const wallsLinearFeet = (width + length) * 2 + interiorWallLength

const lumberSection = createSection('Lumber')

lumberSection.addPart({
	name: 'Studs',
	qty: studsPerFoot * wallsLinearFeet,
	priceLookupKey: '2x4x8',
})

lumberSection.addPart({
	name: 'Sheathing',
	qty: Math.ceil(floorArea / 32),
	priceLookupKey: '4x8x0.5',
})
