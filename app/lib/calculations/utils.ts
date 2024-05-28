export function coerce(value: string, type?: string) {
	if (type === 'number') {
        return +value
    }

    if (type === 'boolean') {
        return value === 'true'
    }

    return value
}
