/**
 * Insert a heading into your input form.
 */
declare function insertHeading(name: string, description: string): void

/**
 * Get the count of an input.
 */
declare function getCount(name: string): number

/**
 * Get the price of an item.
 */
declare function getPrice(name: string): number

/**
 * Get a variable from the user.
 */
declare function getVariable<T>(name: string, defaultValue: T, options?: Record<string, any>): T


/**
 * Get a user input.
 */
declare function getUserInput<T>(name: string, defaultValue: T, options?: Record<string, any>): T

/**
 * Create a section in your takeoff model.
 */
declare function createSection(name: string): void

/**
 * Get items from a category.
 */
declare function getCategoryItems(category: string): void
