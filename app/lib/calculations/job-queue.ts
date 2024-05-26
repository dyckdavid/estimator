import {
	upsertCustomInput,
	type CustomInputElementOptions,
} from './custom-user-input'
import {
	type CustomVariableOptions,
	createCustomVariable,
} from './custom-variables'

type Actions = 'upsert_custom_input' | 'add_custom_variable'

interface Job<T extends Actions> {
	action: T
	payload: T extends 'upsert_custom_input'
		? CustomInputElementOptions
		: CustomVariableOptions
}

export function setupJobQueue(customCalculationId: string) {
	const queue: Job<Actions>[] = []

	function addJob<T extends Actions>(action: T, payload: Job<T>['payload']) {
		queue.push({ action, payload })
	}

	function processJobQueue() {
		const promises = queue.map(job => {
			switch (job.action) {
				case 'upsert_custom_input': {
					const payload = job.payload as CustomInputElementOptions
					return upsertCustomInput(customCalculationId, payload)
				}
				case 'add_custom_variable': {
					const payload = job.payload as CustomVariableOptions
					return createCustomVariable(customCalculationId, payload)
				}
				default:
					return Promise.resolve()
			}
		})
		return Promise.all(promises)
	}

	return {
		addAction: addJob,
		processJobQueue,
	}
}
