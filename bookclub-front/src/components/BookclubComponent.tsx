import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
type Bookclub = {
	id: string
	name: string
	invite_code: string
}

type Props = {
	bookclubId: string
}

export const BookclubComponent = ({ bookclubId }: Props) => {
	const [bookclub, setBookclub] = useState<Bookclub | null>(null)
	const [loading, setLoading] = useState(true)
	useEffect(() => {
		const fetchBookclub = async () => {
			try {
				const res = await fetch(`/api/bookclubs/${bookclubId}`)

				if (!res.ok) {
					setBookclub(null)
					return
				}

				const data = (await res.json()) as Bookclub
				setBookclub(data)
			} finally {
				setLoading(false)
			}
		}

		if (bookclubId) void fetchBookclub()
	}, [bookclubId])

	if (loading) return null
	if (!bookclub) return <div>Book club not found</div>

	return (
		<>
			<PageHeader
				badgeText="Club"
				title={bookclub.name}
				description="Suggest books and decide your next read together."
				buttonText={bookclub.invite_code}
				afterButtonClick="alert"
				buttonOnClick={async () => {
					try {
						await navigator.clipboard.writeText(bookclub.invite_code)
					} catch {}
				}}
			/>
		</>
	)
}
