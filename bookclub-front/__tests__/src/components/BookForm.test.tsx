import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookForm from "../../../src/components/BookForm";
export default BookForm;
import "@testing-library/jest-dom/vitest";

const addBookMock = vi.fn();

describe("BookForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields and submit button", () => {
    render(<BookForm addBook={addBookMock} />);

    expect(screen.getByText(/isbn/i)).toBeInTheDocument();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/author/i)).toBeInTheDocument();
    expect(screen.getByText(/year/i)).toBeInTheDocument();
    expect(screen.getByText(/pages/i)).toBeInTheDocument();
    expect(screen.getByText(/language/i)).toBeInTheDocument();
    expect(screen.getByText(/genre/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /add book/i }),
    ).toBeInTheDocument();
  });

  it("updates input values when user types", async () => {
    const user = userEvent.setup();

    render(<BookForm addBook={addBookMock} />);

    const titleInput = screen.getByPlaceholderText("A Tale of Two Cities");
    const authorInput = screen.getByPlaceholderText("Charles Dickens");

    await user.type(titleInput, "Clean Code");
    await user.type(authorInput, "Robert C. Martin");

    expect(titleInput).toHaveValue("Clean Code");
    expect(authorInput).toHaveValue("Robert C. Martin");
  });

  it("updates textarea (comment field)", async () => {
    const user = userEvent.setup();

    render(<BookForm addBook={addBookMock} />);

    const comment = screen.getByPlaceholderText(
      /add a short note about why this book should be read/i,
    );

    await user.type(comment, "Great book for developers");

    expect(comment).toHaveValue("Great book for developers");
  });

  it("calls addBook with form data on submit", async () => {
    const user = userEvent.setup();

    render(<BookForm addBook={addBookMock} />);

    await user.type(screen.getByPlaceholderText("9780141439600"), "9780451524935");
    await user.type(
      screen.getByPlaceholderText("A Tale of Two Cities"),
      "Clean Code",
    );
    await user.type(
      screen.getByPlaceholderText("Charles Dickens"),
      "Robert C. Martin",
    );
    await user.type(screen.getByPlaceholderText("1859"), "2008");
    await user.type(screen.getByPlaceholderText("544"), "464");
    await user.type(screen.getByPlaceholderText("English"), "English");
    await user.type(
      screen.getByPlaceholderText("Historical fiction"),
      "Programming",
    );
    await user.type(
      screen.getByPlaceholderText(
        /add a short note about why this book should be read/i,
      ),
      "Must-read book",
    );

    const button = screen.getByRole("button", { name: /add book/i });
    await user.click(button);

    expect(addBookMock).toHaveBeenCalledTimes(1);

    expect(addBookMock).toHaveBeenCalledWith({
      isbn: "9780451524935",
      name: "Clean Code",
      author: "Robert C. Martin",
      year: 2008,
      pages: 464,
      language: "English",
      genre: "Programming",
      comment: "Must-read book",
    });
  });

  it("resets form after submit", async () => {
    const user = userEvent.setup();

    render(<BookForm addBook={addBookMock} />);

    const titleInput = screen.getByPlaceholderText("A Tale of Two Cities");

    await user.type(screen.getByPlaceholderText("9780141439600"), "9780596007126");
    await user.type(titleInput, "Clean Code");
    await user.type(
      screen.getByPlaceholderText("Charles Dickens"),
      "Robert C. Martin",
    );

    await user.type(screen.getByPlaceholderText("1859"), "2008");
    await user.type(screen.getByPlaceholderText("544"), "464");
    await user.type(screen.getByPlaceholderText("English"), "English");
    await user.type(
      screen.getByPlaceholderText("Historical fiction"),
      "Programming",
    );

    await user.click(screen.getByRole("button", { name: /add book/i }));

    expect(titleInput).toHaveValue("");
  });

  it("prevents default form submission behavior", async () => {
    const user = userEvent.setup();

    render(<BookForm addBook={addBookMock} />);

    await user.type(screen.getByPlaceholderText("9780141439600"), "9781234567897");
    await user.type(
      screen.getByPlaceholderText("A Tale of Two Cities"),
      "Clean Code",
    );

    await user.type(
      screen.getByPlaceholderText("Charles Dickens"),
      "Robert C. Martin",
    );

    await user.type(screen.getByPlaceholderText("1859"), "2008");
    await user.type(screen.getByPlaceholderText("544"), "464");
    await user.type(screen.getByPlaceholderText("English"), "English");
    await user.type(
      screen.getByPlaceholderText("Historical fiction"),
      "Programming",
    );

    const button = screen.getByRole("button", { name: /add book/i });

    await user.click(button);

    expect(addBookMock).toHaveBeenCalled();
  });

  describe("ISBN validation", () => {
    it("rejects invalid ISBN (too few digits)", async () => {
      const user = userEvent.setup();

      render(<BookForm addBook={addBookMock} />);

      await user.type(screen.getByPlaceholderText("9780141439600"), "123");
      await user.type(
        screen.getByPlaceholderText("A Tale of Two Cities"),
        "Clean Code",
      );
      await user.type(
        screen.getByPlaceholderText("Charles Dickens"),
        "Robert C. Martin",
      );
      await user.type(screen.getByPlaceholderText("1859"), "2008");

      const button = screen.getByRole("button", { name: /add book/i });
      await user.click(button);

      expect(screen.getByText(/Invalid ISBN/i)).toBeInTheDocument();
      expect(addBookMock).not.toHaveBeenCalled();
    });

    it("rejects invalid ISBN (incorrect checksum)", async () => {
      const user = userEvent.setup();

      render(<BookForm addBook={addBookMock} />);

      await user.type(screen.getByPlaceholderText("9780141439600"), "9780451524936");
      await user.type(
        screen.getByPlaceholderText("A Tale of Two Cities"),
        "Clean Code",
      );
      await user.type(
        screen.getByPlaceholderText("Charles Dickens"),
        "Robert C. Martin",
      );
      await user.type(screen.getByPlaceholderText("1859"), "2008");

      const button = screen.getByRole("button", { name: /add book/i });
      await user.click(button);

      expect(screen.getByText(/Invalid ISBN/i)).toBeInTheDocument();
      expect(addBookMock).not.toHaveBeenCalled();
    });

    it("accepts valid ISBN-13 with dashes", async () => {
      const user = userEvent.setup();

      render(<BookForm addBook={addBookMock} />);

      await user.type(screen.getByPlaceholderText("9780141439600"), "978-0-451-52493-5");
      await user.type(
        screen.getByPlaceholderText("A Tale of Two Cities"),
        "Clean Code",
      );
      await user.type(
        screen.getByPlaceholderText("Charles Dickens"),
        "Robert C. Martin",
      );
      await user.type(screen.getByPlaceholderText("1859"), "2008");

      const button = screen.getByRole("button", { name: /add book/i });
      await user.click(button);

      expect(addBookMock).toHaveBeenCalledWith(
        expect.objectContaining({
          isbn: "9780451524935",
        }),
      );
    });

    it("accepts ISBN-10 format", async () => {
      const user = userEvent.setup();

      // 0-306-40615-2 is a valid ISBN-10
      render(<BookForm addBook={addBookMock} />);

      await user.type(screen.getByPlaceholderText("9780141439600"), "0-306-40615-2");
      await user.type(
        screen.getByPlaceholderText("A Tale of Two Cities"),
        "Test Book",
      );
      await user.type(
        screen.getByPlaceholderText("Charles Dickens"),
        "Test Author",
      );
      await user.type(screen.getByPlaceholderText("1859"), "2008");

      const button = screen.getByRole("button", { name: /add book/i });
      await user.click(button);

      expect(addBookMock).toHaveBeenCalledWith(
        expect.objectContaining({
          isbn: "0306406152",
        }),
      );
    });
  });
});
