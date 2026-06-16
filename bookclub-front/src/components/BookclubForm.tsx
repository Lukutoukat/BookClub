import { useState, type ChangeEvent, type SubmitEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import bookclubService, { type CreateBookClub } from '@/services/bookclubs';
import { SectionHeader } from './SectionHeader';
// import bookclubmembersService from '@/services/bookclubmembers'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldContent } from '@/components/ui/field';

const emptyBookclub: CreateBookClub = {
  name: '',
  owner_id: '0',
};

const BookclubForm = () => {
  const [newBookclub, setNewBookclub] = useState<CreateBookClub>(emptyBookclub);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setNewBookclub((currentBookclub) => ({
      ...currentBookclub,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addBookclub: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      const created = await bookclubService.create(newBookclub);
      setNewBookclub(emptyBookclub);
      setErrors([]);
      void navigate(`/club/${created.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors([`Failed to create bookclub: ${errorMessage}`]);
    }
  };
  return (
    <Card className="card-base">
      <SectionHeader title="Create a new bookclub" description="" />

      <CardContent className="card-content">
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm space-y-1">
            {errors.map((error, idx) => (
              <div key={idx}>{error}</div>
            ))}
          </div>
        )}
        <form onSubmit={addBookclub} className="card-form">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel htmlFor="name">Name your book club</FieldLabel>
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
            <p className="max-w-md text-xs text-muted-foreground">
              Double-check for spelling mistakes before creating a new bookclub.
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Create
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookclubForm;
