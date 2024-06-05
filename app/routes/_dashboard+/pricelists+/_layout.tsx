import { Outlet } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#app/components/ui/dialog'
import { Input } from '#app/components/ui/input'
import { Label } from '#app/components/ui/label'

export const handle = {
	breadcrumb: 'Pricelists',
}

export default function PricelistsLayout() {
	return (
		<>
			<Outlet />
		</>
	)
}
