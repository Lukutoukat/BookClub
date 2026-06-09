import { Button } from "./ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SectionHeader } from "./SectionHeader"
import BookSelector from "./BookSelector"
import BookForm from "./BookForm"
import { useState } from "react"

type suggestBookProps = {
  onBookAdded?: () => Promise<void> | void
  bookclubId: string
  cycle_id: string
}

export const SuggestBook = ({
  onBookAdded,
  bookclubId,
  cycle_id,
}: suggestBookProps) => {
  const [isShowingBookForm, setIsShowingBookForm] = useState<boolean>(false)

  const onCreate = () => {
    setIsShowingBookForm(!isShowingBookForm)
    return
  }

  return (
    <Card className="card-base">
      <CardContent>
        <SectionHeader title="Suggest book" />
        <BookSelector onBookAdded={onBookAdded} bookclubId={bookclubId} />
        {isShowingBookForm ? (
          <div>
            <BookForm
              bookToEdit={isShowingBookForm}
              onBookAdded={onBookAdded}
              buttonText="Propose"
              buttonAction={() => setIsShowingBookForm(false)}
              secondaryButtonText="Cancel"
              secondaryButtonAction={() => setIsShowingBookForm(false)}
              className="overflow-visible card-base"
              cycle_id={cycle_id}
            />
          </div>
        ) : (
          <Button onClick={onCreate}> Create book </Button>
        )}
      </CardContent>
    </Card>
  )
}
