import { useState, useEffect } from 'react'
import axios from 'axios'

const baseUrl = '/api/books'
const App = () => {
  const [books, setBooks] = useState([])

  useEffect(() => {
    axios
      .get(baseUrl)
      .then(response => {
        console.log(books)
        setBooks(response.data)
    })
  }, [])
  return (
    <div>
      <h1>books</h1>
      <ul>
        {books.map(book => <li>{book}</li>)}
      </ul>
    </div>
  )
}

export default App
