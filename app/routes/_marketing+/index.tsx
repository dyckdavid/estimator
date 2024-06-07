import { type MetaFunction } from '@remix-run/node'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '#app/components/ui/tooltip.tsx'
import { cn } from '#app/utils/misc.tsx'
import { logos } from './logos/logos.ts'
import { Calculator } from 'lucide-react'
import { Button } from '#app/components/ui/button.js'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => [{ title: 'Estimator' }]

// Tailwind Grid cell classes lookup
const columnClasses: Record<(typeof logos)[number]['column'], string> = {
	1: 'xl:col-start-1',
	2: 'xl:col-start-2',
	3: 'xl:col-start-3',
	4: 'xl:col-start-4',
	5: 'xl:col-start-5',
}
const rowClasses: Record<(typeof logos)[number]['row'], string> = {
	1: 'xl:row-start-1',
	2: 'xl:row-start-2',
	3: 'xl:row-start-3',
	4: 'xl:row-start-4',
	5: 'xl:row-start-5',
	6: 'xl:row-start-6',
}

export default function Index() {
	return (
		<main className="font-poppins min-h-screen place-items-center">
			<div className="grid place-items-center px-4 py-24">
				<div className="flex max-w-2xl flex-col items-start">
					<Calculator className="h-16 w-16 text-primary" />
					<h1
						data-heading
						className="mt-8 animate-slide-top text-4xl font-medium text-foreground [animation-delay:0.3s] [animation-fill-mode:backwards] md:text-5xl xl:mt-4 xl:animate-slide-left xl:text-6xl xl:[animation-delay:0.8s] xl:[animation-fill-mode:backwards]"
					>
						<a href="https://www.epicweb.dev/stack">
							This an early release of the estimator app
						</a>
					</h1>
					<p
						data-paragraph
						className="mt-6 animate-slide-top text-xl/7 text-muted-foreground [animation-fill-mode:backwards] [animation-delay:0.8s] xl:mt-8 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-fill-mode:backwards] xl:[animation-delay:1s]"
					>
						Things might be broken. I am working towards a v0.1.0 realease. You
						can try it and report any issues{' '}
						<a
							className="underline hover:no-underline"
							href="https://github.com/dtremp007/estimator/issues"
						>
							here.
						</a>
					</p>
					<Button asChild className="mt-6">
						<Link to="/signup">Sign up</Link>
					</Button>
				</div>
			</div>
		</main>
	)
}
