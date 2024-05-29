const wallSection = createSection('Wall Section')

const studsPerFoot = getVariable('studsPerFoot', 1)
const wallLength = bd.exteriorWallLinearFeet

wallSection.addPart({
	name: 'Studs',
	qty: studsPerFoot * wallLength,
	priceLookupKey: '2x4x8',
})

const sheathing = createSection('Sheathing')

const sheathingCount = getUserInput('sheathingCount', { default: 0 })

sheathing.addPart({
	name: 'Sheathing',
	qty: sheathingCount.default,
	priceLookupKey: '4x8x1/2',
})
