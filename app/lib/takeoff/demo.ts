import { createContext } from './context'

const { createSection, getUserInput, getVariable } = createContext({} as any)

const width = getUserInput('Width', 25)
const length = getUserInput('Length', 50)
const interiorWallLength = getUserInput('Interior Wall Length', 100)
const studsPerFoot = getVariable('Studs Per Foot', 1)

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
