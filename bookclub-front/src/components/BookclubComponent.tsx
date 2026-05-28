import { useEffect, useState } from 'react'

import { PageHeader } from '../components/PageHeader'

type Bookclub = {
  id: string
  name: string
  invite_code: string
}

type Props = {
  bookclubId: string
}

export const BookclubComponent = ({ bookclubId }: Props) => {
  const [bookclub, setBookclub] = useState<Bookclub | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookclub = async () => {
      try {
        const res = await fetch(`/api/bookclubs/${bookclubId}`)

        if (!res.ok) {
          setBookclub(null)
          return
        }

        const data = (await res.json()) as Bookclub
        setBookclub(data)
      } finally {
        setLoading(false)
      }
    }

    if (bookclubId) void fetchBookclub()
  }, [bookclubId])

  if (loading) return null
  if (!bookclub) return <div>Bookclub not found</div>

  return (
    <>
      <PageHeader
      badgeText="Club"
      title={bookclub.name}
      description="Suggest books and decide together, what books you will enjoy with your friends."
      buttonText={bookclub.invite_code}
      buttonOnClick={async () => {
        try {
          await navigator.clipboard.writeText(bookclub.invite_code)
          alert('Invite code copied!')
        } catch {
          alert('Failed to copy invite code')
        }
      }}
    />

    <div className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] sm:gap-8" />
    </>
  )
}
