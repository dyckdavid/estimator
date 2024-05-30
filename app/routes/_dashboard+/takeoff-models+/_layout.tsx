import { Outlet } from "@remix-run/react";

export const handle = {
	breadcrumb: 'Models',
}

export default function TakeoffModelsLayout() {
    return (
        <div className="m-auto mb-24 mt-16 max-w-3xl">
            <Outlet />
        </div>
    )
}
