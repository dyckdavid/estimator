import { Minus, Plus } from 'lucide-react'
import React from 'react'
import InputDrag from '#app/components/input-with-drag.js'
import { Checkbox } from '#app/components/ui/checkbox.js'
import { Input } from '#app/components/ui/input.js'
import { Label } from '#app/components/ui/label.js'
import { type TakeoffCustomInput } from '#app/lib/takeoff/custom-user-input.js'

type TakeoffCustomInputWithoutProps = Omit<TakeoffCustomInput, 'props'>

type RenderInputProps<T> = {
	input: TakeoffCustomInputWithoutProps & { props: T }
}

export function RenderInput({ input }: RenderInputProps<string>) {
	const inputType = input.type === 'string' ? 'text' : input.type
	const props = React.useMemo(
		() => JSON.parse(input.props) as Record<string, any>,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	if (props.componentType) {
		return (
			<RenderSpecialInput
				input={{
					...input,
					props,
				}}
			/>
		)
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

function RenderSpecialInput({ input }: RenderInputProps<Record<string, any>>) {
	switch (input.props.componentType) {
		case 'Counter':
			return <Counter input={input} />
		case 'Heading':
			return (
				<div className="pt-8">
					<h2 className="text-lg font-semibold">{input.label}</h2>
					<p className="text-sm text-muted-foreground">{input?.description}</p>
				</div>
			)
		default:
			return <p>{input.props.componentType} is not implemented yet.</p>
	}
}

function Counter({ input }: RenderInputProps<Record<string, any>>) {
	const [value, setValue] = React.useState(+(input.defaultValue || 0))

	const handleIncrement = () => {
		setValue(prevValue => prevValue + 1)
	}

	const handleDecrement = () => {
		setValue(prevValue => Math.max(prevValue - 1, 0))
	}

	return (
		<div className="flex items-center justify-between border-b pb-2">
			<label htmlFor={input.id} className="">
				{input.label}
			</label>
			<div className="flex items-center space-x-2">
				<button
					className="rounded-full border border-border p-2 active:translate-y-px"
					onClick={handleDecrement}
					tabIndex={-1}
				>
					<Minus />
				</button>
				<input
					id={input.id}
					type="text"
					inputMode="numeric"
					name={input.name}
					value={value}
					onChange={e => setValue(+(e.target.value || 0))}
					className="w-16 border-none bg-background text-center text-lg font-bold focus:outline-none focus:ring-0"
				/>
				<button
					className="rounded-full border border-border p-2 active:translate-y-px"
					onClick={handleIncrement}
					tabIndex={-1}
				>
					<Plus />
				</button>
			</div>
		</div>
	)
}
