import { Link, useLocation, useMatches } from '@remix-run/react'
import {
	Box,
	Calculator,
	Home,
	LineChart,
	ListChecks,
	MenuIcon,
	Package,
	ShoppingCart,
	Users,
} from 'lucide-react'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '#app/components/ui/drawer'
import { cn } from '#app/utils/misc.js'
import React from 'react'
import { useClickOutside, useMediaQuery } from '@mantine/hooks'
import { Button } from './ui/button'

const navItems = [
	{
		icon: Home,
		label: 'Dashboard',
		href: '#',
	},
	{
		icon: Calculator,
		label: 'Estimations',
		href: '/estimates',
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
	{
		icon: Box,
		label: 'Takeoff Models',
		href: '/takeoff-models',
	},
]

interface DashboardProps {
	className?: string
}

export function DashboardNav({ className }: DashboardProps) {
	const [open, setOpen] = React.useState(false)
	const matches = useMatches()
	const isDesktop = useMediaQuery('(min-width: 768px)')
	const location = useLocation()

	React.useEffect(() => {
		if (!open && isDesktop) return

		setOpen(false)
	}, [location.pathname])

	const Menu = (
		<>
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
		</>
	)

	return (
		<div
			className={cn(
				'top-14 z-10 hidden h-screen w-[250px] border-r border-border bg-background pt-6 sm:sticky sm:block',
                open ? 'block' : 'hidden',
				className,
			)}
		>
			<nav className="grid items-start px-4 text-sm font-medium">{Menu}</nav>
		</div>
    )
}
