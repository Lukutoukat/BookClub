import { useRef } from 'react'

import BookForm from '@/components/BookForm'
import BookList, { type BookListHandle } from '@/components/BookList'
import { PageHeader } from '@/components/PageHeader'
import { Grid } from '@/components/Grid'

const BooksPage = () => {
	const bookListRef = useRef<BookListHandle>(null)

	const handleBookAdded = async () => {
		await bookListRef.current?.reload()
	}

	return (
		<>
			<PageHeader
				badgeText="Books"
				title="Save books"
				description="Save the books you want to read and suggest in the future."
			/>
			<Grid>
				<BookForm onBookAdded={handleBookAdded} cycle_id="" />
				<BookList
					ref={bookListRef}
					emptyMessage="No books suggested yet. Be the first to add one!"
				/>
			</Grid>
		</>
	)
}

export default BooksPage
