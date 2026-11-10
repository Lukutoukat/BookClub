import {cn} from "@/lib/utils.ts";
import type {GenericBook} from "@/types.ts";
import {Button} from "@/components/ui/button.tsx";
import {isFinnaBookRecord} from "@/services/book-providers/finna.ts";
import {isFetchedProviderBook} from "@/services/book-providers";
import {ExternalLink} from "lucide-react";
import React from "react";
import {ButtonDialog} from "@/components/ButtonDialog.tsx";
import {getLanguageLabel, isLanguageCode} from "@/lib/bookLanguages.ts";
import {useTranslation} from "react-i18next";

const Pad = ({hide = false}: { hide?: boolean }) => <div className={(hide && "hidden sm:block") + " h-3"}/>

export interface BookItemActionConfirmation {
    title: string
    description: string
    continue: string
}

export interface BookItemAction {
    id: string,
    label: string,
    Icon?: React.ComponentType<{ "data-icon"?: string; className?: string }>
    type: "default" | "destructive"
    confirmation?: BookItemActionConfirmation
}

interface BookItemProps {
    book: GenericBook,
    actions?: BookItemAction[]
    onAction?: (actionId: string) => void
}

const BookItem = ({book, actions, onAction}: BookItemProps) => {
    const {t} = useTranslation('pages')

    const hasAuthors = book.authors?.length;
    const topAuthors = book.authors?.slice(0, 2) ?? []

    const isFinna = isFetchedProviderBook(book) && isFinnaBookRecord(book)

    return (
        <div className="flex flex-col gap-6 overflow-hidden py-4 ring-1 ring-foreground/10 bg-card border-border/60 w-full rounded-xl sm:rounded-4xl">

            <div className="flex flex-wrap ml-4 gap-3">

                {/* Book Cover */}
                <div className="w-[35%] max-w-30 shrink-0 aspect-30/46 self-start">
                    <div
                        className={cn("flex items-center justify-center rounded-xl w-full h-full", !book.coverUrl && "bg-accent")}>
                        {book.coverUrl ? (
                            <img alt="Book Cover" className="object-cover rounded-xl w-full h-full" src={book.coverUrl}/>
                        ) : (
                            <span className="select-none text-center">?</span>
                        )
                        }
                    </div>
                </div>

                {/* Book Details */}
                <div className="flex flex-col overflow-hidden">
                    {/* Title */}
                    <span className="text-lg md:text-2xl text-nowrap overflow-hidden text-ellipsis font-heading">
                        {book.title}
                    </span>

                    {/* Publication Year */}
                    <span className="text-muted-foreground">
                        {book.year}
                    </span>

                    {/* Spacing */}
                    <Pad hide={false}/>

                    {/* Authors */}
                    <div className="font-light">
                        {hasAuthors ? (
                            <div className="flex gap-0 flex-col sm:flex-row sm:gap-2">
                                {topAuthors.map((author) =>
                                    <span key={author} className="text-nowrap overflow-hidden text-ellipsis">
                                        {author}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span>{t('books.book.noAuthors')}</span>
                        )}
                    </div>

                    <Pad/>

                    {/* Other stats */}
                    <div className="text-muted-foreground flex flex-col">
                        {book.pages && <span>{book.pages}</span>}
                        {book.language && <span>
                            {isLanguageCode(book.language)
                                ? getLanguageLabel(book.language)
                                : book.language}
                        </span>}
                        {isFinna && (
                            <span className="text-blue-500">
                                <a
                                    className="inline-flex items-center gap-1 hover:underline"
                                    target="_blank"
                                    href={'https://helmet.finna.fi/Record/' + book.helmetId}
                                    rel="noreferrer"
                                >
                                {t('books.book.viewOnHelmet')}
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true"/>
                                </a>
                            </span>
                        )}
                    </div>


                </div>

                {/* Action buttons */}
                <div className="ml-auto mr-5">
                    {actions?.map(({id, type, Icon, label, confirmation}) => (
                        <>
                            {confirmation ? (
                                <ButtonDialog
                                    key={id}
                                    buttonText={label}
                                    buttonVariant={type === "destructive" ? "destructive" : "default"}
                                    buttonOnClick={() => onAction?.(id)}
                                    alertDialogText={confirmation.title}
                                    alertDialogDescription={confirmation.description}
                                    alertDialogContinueText={confirmation.continue}
                                />
                            ) : (
                                <Button
                                    key={id}
                                    onClick={() => onAction?.(id)}
                                    variant={type === "destructive" ? "destructive" : "default"}
                                >
                                    {Icon && <Icon data-icon="inline-start" />}
                                    {label}
                                </Button>
                            )}
                        </>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default BookItem