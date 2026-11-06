
export type Notification = {
	message: string
	type: 'success' | 'error'
}

export interface GenericBook {
	id: string,
	title?: string,
	year?: string,
	coverUrl?: string,
	authors?: string[],
	pages?: string,
	description?: string,
	language?: string,
	genres?: string[]
}