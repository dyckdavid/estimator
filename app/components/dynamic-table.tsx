import React from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'

interface Column<
	T extends Record<string, any>,
	K extends keyof T = Extract<keyof T, string>,
> extends React.TdHTMLAttributes<HTMLTableCellElement> {
	key: K
	label?: React.ReactNode
	format?: (value: T[K]) => React.ReactNode
	extract?: (row: T) => any
}

interface DynamicTableProps<T extends Record<string, any>[]> {
	data?: T
	columns: (Column<T[number]> | Extract<keyof T[number], string>)[]
	labelFormatter?: (key: string) => React.ReactNode
}

export function DynamicTable<T extends Record<string, any>[]>({
	data,
	columns,
	labelFormatter,
}: DynamicTableProps<T>) {
	const _columns = React.useMemo(
		() =>
			columns.map(column => {
				if (typeof column === 'string') {
					return {
						key: column,
						label: labelFormatter ? labelFormatter(column) : column,
					} as Column<T[number]>
				}

                if (!column.label) {
                    column.label = labelFormatter ? labelFormatter(column.key) : column.key
                }

				return column
			}),
		[columns, labelFormatter],
	)

	const Header = React.useMemo(() => {
		return (
			<TableHeader>
				<TableRow>
					{_columns.map(({ key, label, format, extract, ...props }) => (
						<TableHead key={key} {...props}>
							{label}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
		)
	}, [_columns])

	const Body = React.useMemo(() => {
		if (!data || data.length === 0) return null

		return (
			<TableBody>
				{data.map((row, i) => (
					<TableRow key={i}>
						{_columns.map(({ key, format, extract, ...props }) => (
							<TableCell key={key} {...props}>
								{format
									? format(extract ? extract(row) : row[key])
									: extract
										? extract(row)
										: row[key]}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		)
	}, [data, _columns])

	return (
		<Table>
			{Header}
			{Body}
		</Table>
	)
}
