import { useRef } from "react";

<<<<<<< HEAD
import BookForm from "@/components/BookForm";
import BookList, { type BookListHandle } from "@/components/BookList";
import { PageHeader } from "@/components/PageHeader";
=======
import BookForm from '@/components/BookForm'
import BookList, { type BookListHandle } from '@/components/BookList'
import { PageHeader } from '@/components/PageHeader'
import { UserLoginDisplay } from '@/components/UserLoginDisplay'
>>>>>>> main

const BooksPage = () => {
  const bookListRef = useRef<BookListHandle>(null);

  const handleBookAdded = async () => {
    await bookListRef.current?.reload();
  };

  return (
    <>
      <UserLoginDisplay />
      <PageHeader
        badgeText="Books"
        title="Save books"
        description="Save the books you want to read and suggest in the future."
      />

      <BookForm onBookAdded={handleBookAdded} cycle_id="" />
      <BookList
        ref={bookListRef}
        emptyMessage="No books suggested yet. Be the first to add one!"
      />
    </>
  );
};

export default BooksPage;
