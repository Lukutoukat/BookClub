import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { BookclubComponent } from "@/components/BookclubComponent"
import BookSelector from "@/components/BookSelector"
import BookList, { type BookListHandle } from "@/components/BookList"
import BookClubGoCycleSetting from "@/components/bookClubGoCycleSetting"
import cycleService from "@/services/cycle"
import { type CycleWithStatus } from "@/services/cycle"

const BookclubPage = () => {
  const { bookclubId } = useParams<{ bookclubId: string }>()
  const bookListRef = useRef<BookListHandle>(null)

  const [currentCycle, setCurrentCycle] = useState<CycleWithStatus>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const cycle = await cycleService.getLatestCycle(bookclubId as string)
        setCurrentCycle(cycle)
      } catch (error) {
        console.error("Failed to load cycle:", error)
      } finally {
        setLoading(false)
      }
    }

    if (bookclubId) void fetchCycle()
  }, [bookclubId])

  const handleBookAdded = async () => {
    await bookListRef.current?.reload()
  }

  if (loading) return null

  // not in a book club
  if (!bookclubId) return <div>Missing bookclub id</div>

  // cycle in proposal phase
  if (currentCycle?.phase === "proposal") {
    return (
      <>
        <BookclubComponent bookclubId={bookclubId} />
        <BookSelector onBookAdded={handleBookAdded} bookclubId={bookclubId} />
        <BookList
          ref={bookListRef}
          show="proposedBooks"
          cycleId={currentCycle.id}
        />
        <BookClubGoCycleSetting bookclubId={bookclubId} />
      </>
    )
  }

  // cycle in voting phase
  if (currentCycle?.phase === "voting") {
    return (
      <>
        <BookclubComponent bookclubId={bookclubId} />
        <BookList
          ref={bookListRef}
          show="votedBooks"
          cycleId={currentCycle.id}
        />
        <BookClubGoCycleSetting bookclubId={bookclubId} />
      </>
    )
  }

  // no cycle in progress
  if (currentCycle?.phase === "over") {
    return (
      <>
        <BookclubComponent bookclubId={bookclubId} />
        <BookClubGoCycleSetting bookclubId={bookclubId} />
      </>
    )
  }

  return (
    <>
      <BookclubComponent bookclubId={bookclubId} />
      <BookClubGoCycleSetting bookclubId={bookclubId} />
    </>
  )
}

export default BookclubPage
