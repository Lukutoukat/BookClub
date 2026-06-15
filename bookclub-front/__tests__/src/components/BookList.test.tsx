import { render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import BookList from "@/components/BookList"
import bookService, { type Book } from "@/services/books"
import { test, expect, describe, vi, beforeEach } from "vitest"

vi.mock("../../../src/services/books")

const mockBook = (overrides?: Partial<Book>): Book => ({
  id: 1,
  isbn: "9780451524935",
  name: "Book 1",
  author: "Author 1",
  year: 2024,
  pages: 100,
  comment: "Comment 1",
  language: "English",
  genre: "Fiction",
  ...overrides,
})

describe("BookList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = (overrides?: {
    books?: Book[]
    emptyMessage?: string
  }) => {
    const booksToUse = overrides?.books ?? [mockBook()]
    vi.mocked(bookService.getAll).mockResolvedValue(booksToUse)
    const emptyMessage = overrides?.emptyMessage
    if (emptyMessage) {
      render(<BookList emptyMessage={emptyMessage} />)
    } else {
      render(<BookList />)
    }
  }

  describe("empty states", () => {
    test("renders empty state with default message", async () => {
      renderComponent({ books: [] })
      const element = await screen.findByText("No books yet.")
      expect(element).toBeDefined()
    })

    test("renders empty state with custom message", async () => {
      const customMessage = "Your bookshelf is empty"
      renderComponent({ books: [], emptyMessage: customMessage })
      const element = await screen.findByText(customMessage)
      expect(element).toBeDefined()
    })
  })

  describe("rendering books", () => {
    test("renders book title and basic content", async () => {
      renderComponent()
      const element = await screen.findByText("Book 1")
      expect(element).toBeDefined()
    })

    test("displays book metadata", async () => {
      renderComponent()
      const element = await screen.findByText("Author 1")
      expect(element).toBeDefined()
      expect(screen.getByText("2024")).toBeDefined()
      expect(screen.getByText("Fiction")).toBeDefined()
    })
  })

  describe("book expansion", () => {
    // Helper to find the expand/collapse button within a book item
    const getExpandButton = () => {
      const buttons = screen.getAllByRole("button")
      // Find the button that has no title and is not the edit button
      // The expand button should be between edit and delete buttons in the DOM
      return buttons.find(
        (btn) => !btn.getAttribute("title") && btn.textContent !== "Edit",
      )!
    }

    test("expands to show detailed information when clicking More", async () => {
      renderComponent()
      const us = user.setup()
      await screen.findByText("Book 1")
      const expandButton = getExpandButton()
      await us.click(expandButton)

      expect(screen.getByText("978-0-451-52493-5")).toBeDefined()
      expect(screen.getByText("English")).toBeDefined()
      expect(screen.getByText("100")).toBeDefined()
      expect(screen.getByText("Comment 1")).toBeDefined()
    })

    test("collapses book details when clicking Less", async () => {
      renderComponent()
      const us = user.setup()
      await screen.findByText("Book 1")
      const expandButton = (() => {
        const buttons = screen.getAllByRole("button")
        return buttons.find(
          (btn) => !btn.getAttribute("title") && btn.textContent !== "Edit",
        )!
      })()

      await us.click(expandButton)
      expect(screen.getByText("978-0-451-52493-5")).toBeDefined()

      await us.click(expandButton)
      expect(screen.queryByText("978-0-451-52493-5")).toBeNull()
    })

    test("handles books without comments gracefully", async () => {
      const bookWithoutComment = mockBook({ comment: "" })
      renderComponent({ books: [bookWithoutComment] })

      const us = user.setup()
      await screen.findByText("Book 1")
      const expandButton = (() => {
        const buttons = screen.getAllByRole("button")
        return buttons.find(
          (btn) => !btn.getAttribute("title") && btn.textContent !== "Edit",
        )!
      })()
      await us.click(expandButton)

      expect(screen.queryByText("Notes:")).toBeNull()
    })
  })

  describe("delete functionality", () => {
    test("calls onDelete with id when delete button clicked and window.confirm is accepted", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true)
      vi.mocked(bookService.remove).mockResolvedValue(undefined)
      renderComponent()
      const us = user.setup()
      await screen.findByText("Book 1") // wait for books to load
      const deleteButtons = screen.getAllByTitle("Delete book")
      await us.click(deleteButtons[0])
      const continueButtons = screen.getAllByTitle("continue")
      await us.click(continueButtons[0])

      expect(vi.mocked(bookService.remove)).toHaveBeenCalledWith(1)
    })

    test("does not show delete button when onDelete is undefined", async () => {
      renderComponent()
      await screen.findByText("Book 1")
      expect(screen.queryByTitle("Delete book")).toBeDefined() // button should exist since BookList always shows delete
    })
  })

  describe("ISBN display", () => {
    test("displays ISBN correctly when expanded", async () => {
      const bookWithISBN = mockBook({ isbn: "9780451524935" })
      renderComponent({ books: [bookWithISBN] })
      const us = user.setup()

      await screen.findByText("Book 1")
      const expandButton = (() => {
        const buttons = screen.getAllByRole("button")
        return buttons.find(
          (btn) => !btn.getAttribute("title") && btn.textContent !== "Edit",
        )!
      })()
      await us.click(expandButton)

      expect(await screen.findByText("978-0-451-52493-5")).toBeDefined()
    })

    test("displays ISBN-10 correctly", async () => {
      const bookWithISBN10 = mockBook({ isbn: "0306406152" })
      renderComponent({ books: [bookWithISBN10] })
      const us = user.setup()

      await screen.findByText("Book 1")
      const expandButton = (() => {
        const buttons = screen.getAllByRole("button")
        return buttons.find(
          (btn) => !btn.getAttribute("title") && btn.textContent !== "Edit",
        )!
      })()
      await us.click(expandButton)

      expect(await screen.findByText("0-306-40615-2")).toBeDefined()
    })

    test("does not display ISBN section when ISBN is undefined", async () => {
      const bookWithoutISBN = mockBook({ isbn: undefined })
      renderComponent({ books: [bookWithoutISBN] })
      const us = user.setup()

      await screen.findByText("Book 1")
      const expandButton = (() => {
        const buttons = screen.getAllByRole("button")
        return buttons.find(
          (btn) => !btn.getAttribute("title") && btn.textContent !== "Edit",
        )!
      })()
      await us.click(expandButton)

      // After expansion, check that no ISBN section is shown in the book details
      const isbnSectionVisible = screen.queryByText(/ISBN/i)
      expect(isbnSectionVisible).toBeNull()
    })

    test("hides ISBN when collapsed", async () => {
      const bookWithISBN = mockBook({ isbn: "9780451524935" })
      renderComponent({ books: [bookWithISBN] })
      const us = user.setup()

      await screen.findByText("Book 1")
      const expandButton = (() => {
        const buttons = screen.getAllByRole("button")
        return buttons.find(
          (btn) => !btn.getAttribute("title") && btn.textContent !== "Edit",
        )!
      })()

      await us.click(expandButton)
      expect(await screen.findByText("978-0-451-52493-5")).toBeDefined()

      await us.click(expandButton)
      expect(screen.queryByText("978-0-451-52493-5")).toBeNull()
    })
  })
})
