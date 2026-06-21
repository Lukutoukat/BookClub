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

<<<<<<< HEAD
	return (
		<>
			<PageHeader
				badgeText="Books"
				title="Save books"
				description="Save the books you want to read and suggest in the future."
			/>
			<Grid>
				<BookForm onBookAdded={handleBookAdded} cycle_id="" />
				<BookList ref={bookListRef} emptyMessage="No books yet." description="Your saved books: " />
			</Grid>
		</>
	)
=======
  return (
    <>
      <UserLoginDisplay />
      <PageHeader
        badgeText="Books"
        title="Save books"
        description="Save the books you want to read and suggest in the future."
      />

      <BookForm onBookAdded={handleBookAdded} cycle_id="" />
      <BookList ref={bookListRef} emptyMessage="No books yet." description="Your saved books: " />
    </>
  )
>>>>>>> develop
}

export default BooksPage
