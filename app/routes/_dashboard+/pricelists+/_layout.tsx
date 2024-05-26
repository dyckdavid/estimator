import { Outlet } from '@remix-run/react'

export const handle = {
	breadcrumb: 'Pricelists',
}

export default function EstimationLayout() {
	return (
		<div className="m-auto mb-24 mt-16 max-w-3xl">
			<Outlet />
		</div>
	)
}
