import { useEffect, useState } from 'react'

import { PageHeader } from '../components/PageHeader'
import { PageMenu } from '@/components/PageMenu'

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

        const data = await res.json()
        setBookclub(data)
      } finally {
        setLoading(false)
      }
    }

    if (bookclubId) fetchBookclub()
  }, [bookclubId])

  if (loading) return null
  if (!bookclub) return <div>Bookclub not found</div>

    return (
    <>
      <PageHeader
        badgeText="Club"
        title={`${bookclub.name} • ${bookclub.invite_code}`}
        description="Suggest books and decide what you will read next together"
        buttonText="Go to books"
        buttonLink="/books"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] sm:gap-8" />

      <PageMenu />
    </>
  )
}
