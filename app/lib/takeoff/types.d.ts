/**
 * Defines the dimensions and characteristics of a building used for various construction calculations.
 */
declare type BuildingDimensionsData = {
	/** The width of the building. */
	width: number
	/** The length of the building. */
	length: number
	/** The height of the walls of the building. */
	wallHeight: number
	/** The thickness of the floor of the building. */
	floorThickness: number
	/** The total length of all interior walls combined. */
	totalInteriorWallsLength: number
	/** The rise of the roof per foot horizontally. */
	roofRisePerFoot: number
	/** The width of the soffit overhang. */
	soffitOverhangWidth: number
}

/**
 * Represents the dimensions of a building, providing various measurements important for construction estimation.
 */
declare class BuildingDimensions {
	/** The width of the building. */
	public width: number
	/** The length of the building. */
	public length: number
	/** The height of the walls of the building. */
	public wallHeight: number
	/** The thickness of the floor of the building. */
	public floorThickness: number
	/** The total length of all interior walls combined. */
	public totalInteriorWallsLength: number
	/** The rise of the roof per foot horizontally. */
	public roofRisePerFoot: number
	/** The width of the soffit overhang. */
	public soffitOverhangWidth: number

	/**
	 * Constructs a new BuildingDimensions instance using specified dimension data.
	 * @param obj The dimension data for the building.
	 */
	constructor(obj: BuildingDimensionsData)

	/** Calculates the surface area of the building's floor. */
	get floorSurfaceArea(): number

	/** Calculates the surface area of the building's exterior walls, including thickness of the floor */
	get exteriorWallSurfaceArea(): number

    /** Calculates the surface area of the building's exterior walls, excluding thickness of the floor */
    get exteriorWallInteriorSurfaceArea() {}

	/** Calculates the surface area of the building's interior walls. */
	get interiorWallSurfaceArea(): number

	/** Calculates the slope factor of the roof based on its rise per foot and soffit overhang. */
	get slopeFactor(): number

	/** Calculates the base length of the roof, accounting for soffit overhang. */
	get roofBaseLength(): number

	/** Calculates the base width of the roof, accounting for soffit overhang. */
	get roofBaseWidth(): number

	/** Calculates the total surface area of the roof. */
	get roofSurfaceArea(): number

	/** Returns the total linear feet of the building's exterior walls. */
	get exteriorWallsLinearFeet(): number

	/** Returns the total linear feet of the building's interior walls. */
	get interiorWallsLinearFeet(): number
}

/**
 * Insert a heading into your input form.
 */
declare function insertHeading(name: string, description: string): void

/**
 * Get the count of an input.
 */
declare function getCount(name: string, defaultValue?: number, options?: Record<string, any>): number

/**
 * Get the price of an item.
 */
declare function getPrice(name: string): number

/**
 * Get a variable from the user.
 */
declare function getVariable<T>(
	name: string,
	defaultValue: T,
	options?: Record<string, any>,
): T

/**
 * Get a user input.
 */
declare function getUserInput<T>(
	name: string,
	defaultValue: T,
	options?: Record<string, any>,
): T

/**
 * Create a section in your takeoff model.
 */
declare function createSection(name: string): void

/**
 * Get items from a category.
 */
declare function getCategoryItems(category: string): void
