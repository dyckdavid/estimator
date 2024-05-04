import { DashboardNav } from '#app/components/dashboard-nav.js'
import { Outlet } from '@remix-run/react'

export default function DashboardRoute() {
	return (
		<div className="flex min-h-screen border-b">
			<DashboardNav className="hidden h-screen w-[250px] border-r border-border pt-6 sm:block" />
			<div className="py-6">
				<Outlet />
			</div>
		</div>
	)
}
