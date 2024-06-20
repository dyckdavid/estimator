import * as ccase from 'change-case'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'

interface CSVTableProps {
	data?: Record<string, any>[]
}

export function CSVTable({ data }: CSVTableProps) {
	if (!data || data.length === 0) return null

	const keys = Object.keys(data[0])

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{keys.map(key => (
						<TableHead key={key}>{ccase.capitalCase(key)}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((row, i) => (
					<TableRow key={i}>
						{keys.map(key => (
							<TableCell key={key}>{row[key]}</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
