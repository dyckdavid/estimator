import { Link, useMatches } from '@remix-run/react'
import { Calculator, Home, LineChart, ListChecks, Package, ShoppingCart, Users } from 'lucide-react'

import { cn } from '#app/utils/misc.js'

const navItems = [
	{
		icon: Home,
		label: 'Dashboard',
		href: '#',
	},
	{
		icon: Calculator,
		label: 'Estimations',
		href: '/estimations',
	},
	{
		icon: ListChecks,
		label: 'Pricelists',
		href: '/pricelists',
	},
	{
		icon: Users,
		label: 'Teams',
		href: '#',
	},
]

interface DashboardProps {
	className?: string
}

export function DashboardNav({ className }: DashboardProps) {
	const matches = useMatches()

	return (
		<div className={cn(className)}>
			<nav className="grid items-start px-4 text-sm font-medium">
				{navItems.map((item, index) => (
					<Link
						key={index}
						to={item.href}
						className={cn(
							'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
							{
								'bg-muted text-primary': matches.some(
									m => m.pathname === item.href,
								),
							},
						)}
					>
						<item.icon className="h-4 w-4" />
						{item.label}
					</Link>
				))}
			</nav>
		</div>
	)
}
