export type ToString = { toString(): string }

export interface LookupTable<T, U, V> {
    table: Map<string, T>
    lookupHistory: V[]

    get(
        name: string,
        defaultValue: any,
        options?: Record<string, any>,
    ): any

    addToLookupHistory(entry: U): void

    saveChanges(takeoffModelId?: string): Promise<void>
  }
