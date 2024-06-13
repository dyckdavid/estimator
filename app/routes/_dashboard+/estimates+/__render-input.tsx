import InputDrag from '#app/components/input-with-drag.js'
import { Checkbox } from '#app/components/ui/checkbox.js'
import { Input } from '#app/components/ui/input.js'
import { Label } from '#app/components/ui/label.js'
import { type TakeoffCustomInput } from '#app/lib/takeoff/custom-user-input.js'
import { Minus, Plus } from 'lucide-react'
import React from 'react'

type RenderInputProps = {
	input: Omit<TakeoffCustomInput, 'props'> & { props: Record<string, any> }
}

export function RenderInput({ input }: RenderInputProps) {
	const inputType = input.type === 'string' ? 'text' : input.type

	if (input.props.componentType) {
		return <RenderSpecialInput input={input} />
	}

	if (input.type === 'boolean') {
		return (
			<div className="flex items-center space-x-2">
				<Checkbox
					id={input.id}
					name={input.name}
					defaultChecked={JSON.parse(input.defaultValue) as boolean}
				/>
				<label
					htmlFor={input.id}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					{input.label}
				</label>
			</div>
		)
	}

	if (input.type === 'number') {
		return (
			<InputDrag
				min="0"
				label={input.label}
				name={input.name}
				defaultValue={input.defaultValue}
			/>
		)
	}

	return (
		<div>
			<Label>
				{input.label}
				<Input type={inputType} defaultValue={input.defaultValue} />
			</Label>
		</div>
	)
}

function RenderSpecialInput({ input }: RenderInputProps) {
	switch (input.props.componentType) {
		case 'Counter':
			return <Counter input={input} />
		default:
			return <p>{input.props.componentType} is not implemented yet.</p>
	}
}

function Counter({ input }: RenderInputProps) {
	const [value, setValue] = React.useState(+(input.defaultValue || 0))

	const handleIncrement = () => {
		setValue(prevValue => prevValue + 1)
	}

	const handleDecrement = () => {
		setValue(prevValue => Math.max(prevValue - 1, 0))
	}

	return (
		<div className="w-fit rounded border border-border px-4 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring">
			<label htmlFor={input.id} className="text-foreground/60">
				{input.label}
			</label>
			<div className="flex items-center space-x-2 p-4">
				<button className="active:translate-y-px" onClick={handleDecrement} tabIndex={-1}>
					<Minus />
				</button>
				<input
					id={input.id}
					type="text"
                    inputMode='numeric'
					name={input.name}
					value={value}
					onChange={e => setValue(+(e.target.value || 0))}
					className="w-24 border-none bg-background text-center text-lg font-bold focus:outline-none focus:ring-0"
				/>
				<button className="active:translate-y-px" onClick={handleIncrement} tabIndex={-1}>
					<Plus />
				</button>
			</div>
		</div>
	)
}
