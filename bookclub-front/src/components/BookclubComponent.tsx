import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useTranslation } from 'react-i18next'

type Bookclub = {
	id: string
	name: string
	invite_code: string
}

type Props = {
	bookclubId: string
}

export const BookclubComponent = ({ bookclubId }: Props) => {
	const { t } = useTranslation('pages')
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
	if (!bookclub) return <div>{t('club.notFound')}</div>

	return (
		<>
			<PageHeader
				badgeText={t('labels.club', { ns: 'common' })}
				title={bookclub.name}
				description={t('club.description')}
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
