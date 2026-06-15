import React, { useState, useEffect, } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

import { type Book } from '@/services/books'
import { type VoteFields } from '@/services/vote'
import { formatISBN } from '@/lib/isbnValidator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { BookResult } from '@/services/results'

const BookItem = ({ book, onDelete, onEdit, isReadOnly, isVotingPhase, onVote, existingVote }: {
  book: Book | BookResult
  onDelete: (id: string) => Promise<void>
  onEdit: () => void
  isReadOnly: boolean
  isVotingPhase: boolean
  onVote: (bookId: string, weight: number, voteId: string | null) => Promise<void>
  existingVote?: VoteFields
}) => {

  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [weight, setWeight] = useState<number | null>(null)
  const [voteId, setVoteId] = useState<string | null>(null)

  const isBookResult = (book: Book | BookResult): book is BookResult => {
    return 'score' in book
  }

  useEffect(() => {
    if (isVotingPhase && existingVote) {
      setWeight(existingVote.weight ?? null)
      setVoteId(existingVote.id)
    }
  }, [isVotingPhase, existingVote])

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!book.id) return
    if (window.confirm('Are you sure you want to delete?')) {
      setIsDeleting(true)
        try {
          await onDelete(book.id)
        } finally {
          setIsDeleting(false)
        }
    }
  }

  return (
      <Card className="border-border/60 bg-background/80 shadow-sm transition-all hover:bg-background/90">
        <CardContent className="px-3 py-2 sm:px-4 sm:py-3 pl-4 sm:pl-5">
          <div className="flex flex-row items-start gap-3 justify-between">
            {isReadOnly && isBookResult(book) && (
              <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-primary/10 border border-primary/20 mr-3">
                <span className="font-bold text-primary text-sm sm:text-lg md:text-2xl leading-none">
                  {book.score}
                </span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground uppercase">
                  pts
                </span>
              </div>
            )}
            <div className="space-y-0.5 flex-1 cursor-pointer">
              <div className="flex flex-wrap items-center gap-2  w-full">

                <h3 className="text-lg font-semibold text-foreground/90">
                  {book.name}
                </h3>

                {book.genre && (
                  <Badge variant="secondary" className="font-normal text-xs">
                    {book.genre}
                  </Badge>
                )}

                {!isReadOnly && !isVotingPhase && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    className="gap-3 ml-auto shrink-0"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>

              <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                <span className="font-medium text-foreground/70">{book.author}</span>
                <span>&bull;</span>
                <span>{book.year}</span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 self-end sm:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1 text-muted-foreground hover:text-foreground"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="text-xs font-medium hidden sm:inline">{isExpanded ? 'Less' : 'More'}</span>
              </Button>

              {isVotingPhase && (
                <RadioGroup
                  value={weight?.toString() ?? ""}
                  onValueChange={async (val) => {
                    const w = Number(val)
                    setWeight(w)
                    if (!book.id) return
                    if (!book.proposal_id) return

                    await onVote(book.proposal_id, w, voteId ?? null)
                  }
                }
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="3" id={`want-${book.id}`} />
                    <Label htmlFor={`want-${book.id}`}>Want to read</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="2" id={`could-${book.id}`} />
                    <Label htmlFor={`could-${book.id}`}>Could read</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="0" id={`dont-${book.id}`}/>
                    <Label htmlFor={`dont-${book.id}`}>Don&apos;t want to read</Label>
                  </div>
                </RadioGroup>
              )}
              
              {!isReadOnly && !isVotingPhase && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete book"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Separator className="mb-2 opacity-50" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Language</p>
                  <p className="font-medium text-sm">{book.language}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Pages</p>
                  <p className="font-medium text-sm">{book.pages}</p>
                </div>
                {book.isbn && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">ISBN</p>
                    <p className="font-medium font-mono text-xs">{formatISBN(book.isbn)}</p>
                  </div>
                )}
              </div>
              
              {book.comment && (
                <div className="bg-muted/30 rounded-lg p-2 border border-border/40">
                  <p className="text-sm leading-relaxed text-foreground/80">
                    <span className="font-semibold text-foreground/90 mr-1">Notes:</span>
                    {book.comment}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
  )
}

export default BookItem