/*
 * Read the blog post here:
 * https://letsbuildui.dev/articles/building-a-segmented-control-component
 */
export function SegmentedControl({
	name,
	segments,
	defaultIndex = 0,
}: {
	name: string
	segments: { label: string; value: string }[]
	defaultIndex?: number
}) {
    return null
	// const [activeIndex, setActiveIndex] = React.useState(defaultIndex)
	// const componentReady = React.useRef()
	// const controlRef = React.useRef()

	// const onInputChange = (value, index) => {
	// 	setActiveIndex(index)
	// }

	// return (
	// 	<div className="controls-container" ref={controlRef}>
	// 		<div className={`controls ${componentReady.current ? 'ready' : 'idle'}`}>
	// 			{segments?.map((item, i) => (
	// 				<div
	// 					key={item.value}
	// 					className={`segment ${i === activeIndex ? 'active' : 'inactive'}`}
	// 				>
	// 					<input
	// 						type="radio"
	// 						value={item.value}
	// 						id={item.label}
	// 						name={name}
	// 						onChange={() => onInputChange(item.value, i)}
	// 						checked={i === activeIndex}
	// 					/>
	// 					<label htmlFor={item.label}>{item.label}</label>
	// 				</div>
	// 			))}
	// 		</div>
	// 	</div>
	// )
}
