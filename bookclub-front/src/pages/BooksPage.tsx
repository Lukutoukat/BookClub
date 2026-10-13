import { useRef } from 'react'

import BookForm from '@/components/BookForm'
import BookList, { type BookListHandle } from '@/components/BookList'
import { PageHeader } from '@/components/PageHeader'
import { Column } from '@/components/Column'
import { useTranslation } from 'react-i18next'

const BooksPage = () => {
	const { t } = useTranslation()
	const bookListRef = useRef<BookListHandle>(null)

	const handleBookAdded = async () => {
		await bookListRef.current?.reload()
	}

	return (
		<>
			<PageHeader
				badgeText={t('labels.books')}
				title={t('books.title', { ns: 'pages' })}
				description={t('books.description', { ns: 'pages' })}
			/>
			<Column>
				<BookForm onBookAdded={handleBookAdded} cycle_id="" />
				<BookList ref={bookListRef} emptyMessage={t('books.saved.empty', { ns: 'pages' })} description={t('books.saved.title', { ns: 'pages' })} />
			</Column>
		</>
	)
}

export default BooksPage
