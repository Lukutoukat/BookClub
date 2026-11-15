import React, {useState} from "react";
import type {GenericBook} from "@/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import BookForm from "@/components/BookForm.tsx";
import HelmetBookSearch from "@/components/book/HelmetBookSearch.tsx";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {toGeneric} from "@/services/books.ts";
import {useTranslation} from "react-i18next";

interface BookCreationDialogProps {
    DialogButton: React.ReactElement,
    onSelectBook: (book: GenericBook) => void,
}

const BookCreationDialog = ({DialogButton, onSelectBook}: BookCreationDialogProps) => {
    const {t} = useTranslation('pages')

    const [tab, setTab] = useState<string>("helmet");
    const [open, setOpen] = useState<boolean>(false)

    const selectBook = (book: GenericBook) => {
        onSelectBook(book)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} defaultOpen={true}>
            <DialogTrigger asChild>
                {DialogButton}
            </DialogTrigger>
            <DialogContent
                className="min-w-[80%] rounded-xl sm:rounded-4xl p-4 max-h-[90dvh] overflow-y-scroll">
                <div className="min-w-0">

                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl sm:text-4xl">{t('books.dialog.title')}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 pt-2 w-full min-w-0">

                        <ToggleGroup type="single" value={tab} onValueChange={(value) => value && setTab(value)}>
                            <ToggleGroupItem value="helmet">{t('books.dialog.helmet.tab')}</ToggleGroupItem>
                            <ToggleGroupItem value="manual">{t('books.dialog.manual.tab')}</ToggleGroupItem>
                        </ToggleGroup>

                        {tab === "helmet" ? (
                            <>
                                <HelmetBookSearch onSelectBook={(book) => {
                                    selectBook(book)
                                }}/>
                            </>
                        ) : (
                            <>
                                <BookForm helmetSearch={false} headless={true} cycle_id="" onBookAdded={(book) => {
                                    if (book)
                                        selectBook(toGeneric({
                                            ...book,
                                            id: self.crypto.randomUUID(),
                                        }))
                                }} />
                            </>
                        )}
                    </div>


                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default BookCreationDialog