import type { CreateBookclub } from "../services/bookclubs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type BookclubFormProps = {
    addBookclub: (event: React.SyntheticEvent<HTMLFormElement>) => Promise<void>,
    newBookclub: CreateBookclub,
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const BookclubForm = ({
    addBookclub,
    newBookclub,
    handleChange
}: BookclubFormProps) => {
    return (
      <form onSubmit={addBookclub} className="space-y-4 sm:space-y-6">
      <div className="grid gap-4 rounded-3xl border border-border/70 bg-muted/20 p-4 shadow-sm sm:gap-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-foreground">
            Name your bookclub
          </Label>
          <Input
            id="name"
            name="name"
            value={newBookclub.name}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Read It And Weep"
            required
          />
        </div>  
        </div> 

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
        <p className="max-w-md text-sm text-muted-foreground">
          Double-check for spelling mistakes before creating a new bookclub.
        </p>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Create
        </Button>
      </div>

    </form>
    )
}

export default BookclubForm