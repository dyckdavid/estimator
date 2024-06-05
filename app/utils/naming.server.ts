import { prisma } from './db.server'

export async function nameTheThing(name: string, table: string) {
    // @ts-expect-error - table is a string
	const names = await prisma[table].findMany({
		where: {
			name: {
				contains: name,
			},
		},
		select: {
			name: true,
		},
	})

	return createGenericName(name, names)
}

export function createGenericName<T extends { name: string }>(
	name: string,
	list: T[],
) {
	name = name.trim() + ' '

	if (list.length === 0) return name

	const names = list.map(item => item.name)
	const nameNumbers = names.map(name => {
		const number = parseInt(name.replace(name, ''))
		return isNaN(number) ? 1 : number
	})
	const maxNumber = Math.max(...nameNumbers)
	return `${name} ${maxNumber + 1}`
}
