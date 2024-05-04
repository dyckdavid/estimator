import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetcher,
	useFetchers,
	useLoaderData,
	useMatches,
	useSubmit,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import {
	Bell,
	Home,
	LineChart,
	Menu,
	Package,
	ShoppingCart,
	Users,
} from 'lucide-react'
import { useRef } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { EpicProgress } from './components/progress-bar.tsx'
import { SearchBar } from './components/search-bar.tsx'
import { useToast } from './components/toaster.tsx'
import { Badge } from './components/ui/badge.tsx'
import { Button } from './components/ui/button.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './components/ui/card.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from './components/ui/dropdown-menu.tsx'
import { Icon, href as iconsHref } from './components/ui/icon.tsx'
import { ScrollArea } from './components/ui/scroll-area.tsx'
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet.tsx'
import { EpicToaster } from './components/ui/sonner.tsx'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints, useHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import { combineHeaders, getDomainUrl, getUserImgSrc } from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { useRequestInfo } from './utils/request-info.ts'
import { type Theme, setTheme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useOptionalUser, useUser } from './utils/user.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		//These should match the css preloads above to avoid css as render blocking resource
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? 'Epic Notes' : 'Error | Epic Notes' },
		{ name: 'description', content: `Your own captain's log` },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	return json(
		{
			user,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

const ThemeFormSchema = z.object({
	theme: z.enum(['system', 'light', 'dark']),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ThemeFormSchema,
	})

	invariantResponse(submission.status === 'success', 'Invalid theme received')

	const { theme } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	}
	return json({ result: submission.reply() }, responseInit)
}

function Document({
	children,
	nonce,
	theme = 'light',
	env = {},
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string>
}) {
	return (
		<html lang="en" className={`${theme} h-full overflow-x-hidden`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Links />
			</head>
			<body className="bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const user = useOptionalUser()
	const theme = useTheme()
	const matches = useMatches()
	const isOnSearchPage = matches.find(m => m.id === 'routes/users+/index')
	const searchBar = isOnSearchPage ? null : <SearchBar status="idle" />
	useToast(data.toast)

	return (
		<Document nonce={nonce} theme={theme} env={data.ENV}>
			<div className="relative flex min-h-screen flex-col">
				<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container flex h-14 max-w-screen-2xl items-center gap-4">
						<Logo />
						<div className="ml-auto hidden max-w-sm flex-1 sm:block">
							{searchBar}
						</div>
						<div className="block w-full sm:hidden"></div>
						{user ? (
							<UserDropdown />
						) : (
							<Button asChild variant="default" size="lg">
								<Link to="/login">Log In</Link>
							</Button>
						)}
					</div>
				</header>
				<main className="flex-1">
					<Outlet />
				</main>
				<footer className="py-6 md:px-8 md:py-0">
					<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
						<p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
							© {new Date().getFullYear()} Estimator
						</p>
					</div>
				</footer>
			</div>
			{/* <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
				<div className="hidden border-r bg-muted/40 md:block">
					<div className="flex h-full max-h-screen flex-col gap-2">
						<div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
							<Logo />
							<Button variant="outline" size="icon" className="ml-auto h-8 w-8">
								<Bell className="h-4 w-4" />
								<span className="sr-only">Toggle notifications</span>
							</Button>
						</div>
						<div className="flex-1">
							<nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
						<div className="mt-auto p-4">
							<Card x-chunk="dashboard-02-chunk-0">
								<CardHeader className="p-2 pt-0 md:p-4">
									<CardTitle>Upgrade to Pro</CardTitle>
									<CardDescription>
										Unlock all features and get unlimited access to our support
										team.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-2 pt-0 md:p-4 md:pt-0">
									<Button size="sm" className="w-full">
										Upgrade
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				<div className="flex flex-col">
					<header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="shrink-0 md:hidden"
								>
									<Menu className="h-5 w-5" />
									<span className="sr-only">Toggle navigation menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="flex flex-col">
								<nav className="grid gap-2 text-lg font-medium">
									<Logo />
									<Link
										to="#"
										className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
									>
										<Home className="h-5 w-5" />
										Dashboard
									</Link>
									<Link
										to="#"
										className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
									>
										<ShoppingCart className="h-5 w-5" />
										Orders
										<Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
											6
										</Badge>
									</Link>
									<Link
										to="#"
										className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
									>
										<Package className="h-5 w-5" />
										Products
									</Link>
									<Link
										to="#"
										className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
									>
										<Users className="h-5 w-5" />
										Customers
									</Link>
									<Link
										to="#"
										className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
									>
										<LineChart className="h-5 w-5" />
										Analytics
									</Link>
								</nav>
								<div className="mt-auto">
									<Card>
										<CardHeader>
											<CardTitle>Upgrade to Pro</CardTitle>
											<CardDescription>
												Unlock all features and get unlimited access to our
												support team.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<Button size="sm" className="w-full">
												Upgrade
											</Button>
										</CardContent>
									</Card>
								</div>
							</SheetContent>
						</Sheet>
						<div className="ml-auto hidden max-w-sm flex-1 sm:block">
							{searchBar}
						</div>
						<div className="block w-full sm:hidden"></div>
						{user ? (
							<UserDropdown />
						) : (
							<Button asChild variant="default" size="lg">
								<Link to="/login">Log In</Link>
							</Button>
						)}
					</header>
					<main className="flex-1">
						<ScrollArea className="h-[calc(100vh-56px)] lg:h-[calc(100vh-60px)]">
							<Outlet />
						</ScrollArea>
					</main>
				</div>
			</div> */}
			{/* <div className="flex h-screen flex-col justify-between">
				<header className="container py-6">
					<nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
						<Logo />
						<div className="ml-auto hidden max-w-sm flex-1 sm:block">
							{searchBar}
						</div>
						<div className="flex items-center gap-10">
							{user ? (
								<UserDropdown />
							) : (
								<Button asChild variant="default" size="lg">
									<Link to="/login">Log In</Link>
								</Button>
							)}
						</div>
						<div className="block w-full sm:hidden">{searchBar}</div>
					</nav>
				</header>

				<div className="flex-1">
					<Outlet />
				</div>

				<div className="container flex justify-between pb-5">
					<Logo />
					<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
				</div>
			</div> */}
			<EpicToaster closeButton position="top-center" theme={theme} />
			<EpicProgress />
		</Document>
	)
}

function Logo() {
	return (
		<Link to="/" className="flex gap-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				strokeWidth="1.5"
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M4 3m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
				<path d="M8 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
				<path d="M8 14l0 .01" />
				<path d="M12 14l0 .01" />
				<path d="M16 14l0 .01" />
				<path d="M8 17l0 .01" />
				<path d="M12 17l0 .01" />
				<path d="M16 17l0 .01" />
			</svg>
			<span>Estimator</span>
		</Link>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default withSentry(AppWithProviders)

function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button asChild variant="secondary">
					<Link
						to={`/users/${user.username}`}
						// this is for progressive enhancement
						onClick={e => e.preventDefault()}
						className="flex items-center gap-2"
					>
						<img
							className="h-8 w-8 rounded-full object-cover"
							alt={user.name ?? user.username}
							src={getUserImgSrc(user.image?.id)}
						/>
						<span className="text-body-sm font-bold">
							{user.name ?? user.username}
						</span>
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}`}>
							<Icon className="text-body-md" name="avatar">
								Profile
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}/notes`}>
							<Icon className="text-body-md" name="pencil-2">
								Notes
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={event => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Icon className="text-body-md" name="exit">
								<button type="submit">Logout</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
	const hints = useHints()
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}
	return requestInfo.userPrefs.theme ?? hints.theme
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find(f => f.formAction === '/')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}

function ThemeSwitch({ userPreference }: { userPreference?: Theme | null }) {
	const fetcher = useFetcher<typeof action>()

	const [form] = useForm({
		id: 'theme-switch',
		lastResult: fetcher.data?.result,
	})

	const optimisticMode = useOptimisticThemeMode()
	const mode = optimisticMode ?? userPreference ?? 'system'
	const nextMode =
		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
	const modeLabel = {
		light: (
			<Icon name="sun">
				<span className="sr-only">Light</span>
			</Icon>
		),
		dark: (
			<Icon name="moon">
				<span className="sr-only">Dark</span>
			</Icon>
		),
		system: (
			<Icon name="laptop">
				<span className="sr-only">System</span>
			</Icon>
		),
	}

	return (
		<fetcher.Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="theme" value={nextMode} />
			<div className="flex gap-2">
				<button
					type="submit"
					className="flex h-8 w-8 cursor-pointer items-center justify-center"
				>
					{modeLabel[mode]}
				</button>
			</div>
		</fetcher.Form>
	)
}

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
