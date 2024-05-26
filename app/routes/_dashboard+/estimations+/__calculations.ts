import { Calculation } from '#app/lib/calculations/assembly.class'

const STUDS_PER_FOOT = 1
const WASTE = 1.05

export function getCalculations() {
	return [
		new Calculation('Walls', ({ self, bd }) => {
			// Exterior walls
			const numberOfStuds = bd.exteriorWallLinearFeet * STUDS_PER_FOOT
			const platesLF = bd.exteriorWallLinearFeet * 3 * WASTE
			const exteriorPlates = Math.ceil(platesLF / 16)

			self.addPart('2x4x8', numberOfStuds)
			self.addPart('2x4x16', exteriorPlates)

			// Interior walls
			const interiorStuds = bd.interiorWallLinearFeet * STUDS_PER_FOOT
			const interiorPlatesLF = bd.interiorWallLinearFeet * 3 * WASTE
			const interiorPlates = Math.ceil(interiorPlatesLF / 16)

			self.addPart('2x4x8', interiorStuds)
			self.addPart('2x4x16', interiorPlates)

			// Sheathing
			const sheathing = Math.ceil((bd.exteriorWallSurfaceArea * WASTE) / 32)

			self.addPart('4x8x1/2 OSB', sheathing)
		}),

		new Calculation('Roof', ({ self, bd }) => {
			const raftersQty = bd.roofBaseLength / 2
			const ridgeBoardLF =
				(bd.roofBaseLength + bd.roofBaseWidth * bd.slopeFactor) * 2 * WASTE

			self.addPart('2x4x16', raftersQty * 3)
			self.addPart('2x4x16', Math.ceil(ridgeBoardLF / 16))
			self.addPart('4x8x1/2 OSB', Math.ceil((bd.roofSurfaceArea * WASTE) / 32))
		}),
	]
}
