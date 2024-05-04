import { Link } from '@remix-run/react'
import { Home, LineChart, Package, ShoppingCart, Users } from 'lucide-react'

import { Badge } from '#app/components/ui/badge'
import { cn } from '#app/utils/misc.js'

interface DashboardProps {
	className?: string
}

export function DashboardNav({ className }: DashboardProps) {
	return (
		<div className={cn(className)}>
			<nav className="grid items-start px-4 text-sm font-medium">
				<Link
					to="#"
					className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
				>
					<Home className="h-4 w-4" />
					Dashboard
				</Link>
				<Link
					to="#"
					className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
				>
					<ShoppingCart className="h-4 w-4" />
					Orders
					<Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
						6
					</Badge>
				</Link>
				<Link
					to="#"
					className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
				>
					<Package className="h-4 w-4" />
					Products{' '}
				</Link>
				<Link
					to="#"
					className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
				>
					<Users className="h-4 w-4" />
					Customers
				</Link>
				<Link
					to="#"
					className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
				>
					<LineChart className="h-4 w-4" />
					Analytics
				</Link>
			</nav>
		</div>
	)
}
