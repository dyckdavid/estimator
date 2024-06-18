export type BuildingDimensionsData =  {
    width: number
    length: number
    wallHeight: number
    floorThickness: number
    totalInteriorWallsLength: number
    roofRisePerFoot: number
    soffitOverhangWidth: number
}

export class BuildingDimensions {
	public width: number
	public length: number
	public wallHeight: number
    public floorThickness: number
	public totalInteriorWallsLength: number
	public roofRisePerFoot: number
	public soffitOverhangWidth: number

	constructor(obj: BuildingDimensionsData) {
		this.width = obj.width
		this.wallHeight = obj.wallHeight
		this.length = obj.length
        this.floorThickness = obj.floorThickness
		this.totalInteriorWallsLength = obj.totalInteriorWallsLength
		this.roofRisePerFoot = obj.roofRisePerFoot
		this.soffitOverhangWidth = obj.soffitOverhangWidth
	}

	get floorSurfaceArea() {
		return this.width * this.length
	}

	get exteriorWallSurfaceArea() {
		return 2 * (this.wallHeight + this.floorThickness) * (this.width + this.length)
	}

    get exteriorWallInteriorSurfaceArea() {
        return this.width * this.wallHeight * 2 + this.length * this.wallHeight * 2
    }

	get interiorWallSurfaceArea() {
		return this.totalInteriorWallsLength * this.wallHeight * 2
	}

	get slopeFactor() {
		return (
			Math.sqrt(
				Math.pow(this.roofRisePerFoot, 2) +
					Math.pow(this.soffitOverhangWidth, 2),
			) / 12
		)
	}

	get roofBaseLength() {
		return this.length + 2 * this.soffitOverhangWidth
	}

	get roofBaseWidth() {
		return this.width + 2 * this.soffitOverhangWidth
	}

	get roofSurfaceArea() {
		return this.roofBaseLength * this.roofBaseWidth * this.slopeFactor
	}

    get roofPerimeter() {
        return (this.roofBaseLength + this.roofBaseWidth) * 2
    }

	get exteriorWallsLinearFeet() {
		return 2 * (this.width + this.length)
	}

	get interiorWallsLinearFeet() {
		return this.totalInteriorWallsLength
	}
}
