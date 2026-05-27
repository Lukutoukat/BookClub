import { useState } from 'react'
import bookclubService, { type CreateBookclub } from "../services/bookclubs"
import { SectionHeader } from './SectionHeader'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'

const emptyBookclub: CreateBookclub = {
  name: '',
}

const BookclubForm = () => {
  const [newBookclub, setNewBookclub] = useState<CreateBookclub>(emptyBookclub)
  
  const handleChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
      const { name, value } = event.target

      setNewBookclub((currentBookclub) => ({
      ...currentBookclub,
      [name]: value
      }))
  }

  const addBookclub = async (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault()
      await bookclubService.create(newBookclub)
  }
    return (
      <Card className="card-base">
        <SectionHeader 
        title="Create a new bookclub" 
        description="Create a new bookclub, where you can invite your friends to join"
        />
        
      <CardContent className="card-content">
      <form onSubmit={addBookclub} className="card-form">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
        <div className="sm:col-span-2">
          <Field>
            <FieldLabel htmlFor="name">Name your bookclub</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                name="name"
                value={newBookclub.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Read It And Weep"
                required
              />
            </FieldContent>
          </Field>
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
    </CardContent>
  </Card>
  )
}

export default BookclubForm