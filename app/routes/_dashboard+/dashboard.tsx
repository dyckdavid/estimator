import { Link } from '@remix-run/react'

export default function Dashboard() {
	return (
		<div className="main-container prose dark:prose-invert">
			<h1>Welcome to Estimator v0.1.0-prerelease</h1>
			<p>
				Estimator is a simple tool to help you estimate the cost of a project.
			</p>
			<h2>How to use</h2>
			<h3>Step 1: Upload a pricelist</h3>
			<p>
				Google Sheets integrating is coming soon. For now, you can upload a CSV
				file. You can do that <Link to="/pricelists">here</Link>.
				<br />
				<br />
				Here are the columns that are required:
			</p>
			<ul>
				<li>Category</li>
				<li>Name</li>
				<li>Unit Type</li>
				<li>Price Per Unit</li>
				<li>Currency</li>
			</ul>
			<h3>Step 2: Create a takeoff model</h3>
			<p>
				A takeoff model consists of variables, inputs, and formulas. You can
				create one <Link to="/takeoff-models">here</Link>. More documentation
				coming soon.
			</p>
			<h3>Step 3: Create an estimate</h3>
			<p>
				Once you have a pricelist and a takeoff model, you can create an
				estimate. You can do that <Link to="/estimates">here</Link>.
			</p>
		</div>
	)
}
