import { Outlet } from '@remix-run/react'

export const handle = {
	breadcrumb: 'Estimations',
}

export default function EstimationLayout() {
	return <Outlet />
}
