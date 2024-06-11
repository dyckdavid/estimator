import * as React from 'react'

import { cn } from '#app/utils/misc.tsx'

export interface SelectProps
	extends React.InputHTMLAttributes<HTMLSelectElement> {}

const NativeSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ children, className, type, ...props }, ref) => {
		return (
			<select
				className={cn(
					'flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground',
					className,
				)}
				ref={ref}
				{...props}
			>
				{children}
			</select>
		)
	},
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
