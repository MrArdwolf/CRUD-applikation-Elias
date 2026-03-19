document.getElementById("add-book").addEventListener("click", (e) => {
    e.preventDefault()
    createAddForm()
})
document.getElementById("get-books").addEventListener("click", (e) => {
    e.preventDefault()
    getBooks()
})
const bookContainer = document.getElementById("bookContainer")
const app = document.getElementById("app")

async function updateBookContainer(books) {
    while (bookContainer.firstChild) {
        bookContainer.removeChild(bookContainer.firstChild)
    }
    console.log("Updating book container with books:", books)
    for (const book of books) {
        try {
            const bookElement = document.createElement("div");
            bookElement.classList.add("book");

            const titleElement = document.createElement("h3");
            titleElement.textContent = "Title:";

            const titleValue = document.createElement("p");
            titleValue.textContent = book.title;

            const descriptionElement = document.createElement("h3");
            descriptionElement.textContent = "Description:";

            const descriptionValue = document.createElement("p");
            descriptionValue.textContent = book.description;

            const authorElement = document.createElement("h3");
            authorElement.textContent = "Author:";

            const author = await getAuthorById(book.author)

            const authorValue = document.createElement("p");
            authorValue.textContent = author ? author.name : "Unknown";
            if (author) {
                authorValue.addEventListener("click", async () => {
                    await getBooksByAuthor(author.id)
                });
            }

            const yearElement = document.createElement("h3");
            yearElement.textContent = "Year:";

            const yearValue = document.createElement("p");
            yearValue.textContent = book.year;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                deleteBook(book.id)
            })

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => {
                createEditForm(book, bookElement)
            })

            bookElement.appendChild(titleElement);
            bookElement.appendChild(titleValue);
            bookElement.appendChild(descriptionElement);
            bookElement.appendChild(descriptionValue);
            bookElement.appendChild(authorElement);
            bookElement.appendChild(authorValue);
            bookElement.appendChild(yearElement);
            bookElement.appendChild(yearValue);
            bookElement.appendChild(deleteButton);
            bookElement.appendChild(editButton);
            bookContainer.appendChild(bookElement);
        } catch (error) {
            console.error("Error creating book element:", error)
        }
    }
}


async function getBooks() {
    try {
        const response = await fetch("http://localhost:3000/books")
        const data = await response.json()
        console.log(data)
        await updateBookContainer(data)
        return data
    } catch (error) {
        console.error("Error fetching books:", error)
    }
}

async function getBookById(id) {
    try {
        const response = await fetch(`http://localhost:3000/books/${id}`)
        return await response.json()
    } catch (error) {
        console.error("Error fetching book by ID:", error)
    }
}

async function getBooksByAuthor(author) {
    try {
        console.log("Fetching books by author with ID:", author)
        const authorData = await getAuthorById(author)
        if (!authorData) {
            throw new Error("Author not found")
        }
            console.log("Author data fetched:", authorData)
            console.log("Book IDs for author:", authorData.books)
        const bookdata = await Promise.all(authorData.books.map(bookId => getBookById(bookId)))
        console.log("Book data promises:", bookdata)
        await updateBookContainer(bookdata)
    } catch (error) {
        console.error("Error fetching books by author:", error)
    }
}

async function createAddForm() {
    const form = document.createElement("form")
    form.classList.add("add-form")

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Title:";
    titleLabel.htmlFor = "title"

    const titleInput = document.createElement("input")
    titleInput.type = "text"
    titleInput.required = true
    titleInput.placeholder = "Enter book title"
    titleInput.name = "title"

    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Description:";
    descriptionLabel.htmlFor = "description"

    const descriptionInput = document.createElement("textarea")
    descriptionInput.required = true
    descriptionInput.placeholder = "Enter book description"
    descriptionInput.name = "description"

    const authorLabel = document.createElement("label");
    authorLabel.textContent = "Author:";
    authorLabel.htmlFor = "author"

    const authorInput = document.createElement("select")
    authorInput.required = true
    authorInput.name = "author"

    const authors = await fetch("http://localhost:3000/authors").then(res => res.json())
    authors.forEach(author => {
        const option = document.createElement("option")
        option.value = author.name
        option.textContent = author.name
        authorInput.appendChild(option)
    })

    const newAuthorInput = document.createElement("input")
    newAuthorInput.type = "text"
    newAuthorInput.placeholder = "Or enter new author"
    newAuthorInput.name = "newAuthor"

    const yearLabel = document.createElement("label");
    yearLabel.textContent = "Year:";
    yearLabel.htmlFor = "year"

    const yearInput = document.createElement("input")
    yearInput.type = "number"
    yearInput.name = "year"

    const addButton = document.createElement("button")
    addButton.textContent = "Add"
    addButton.type = "submit"

    const cancelButton = document.createElement("button")
    cancelButton.textContent = "Cancel"
    cancelButton.type = "button"
    cancelButton.addEventListener("click", () => {
        form.remove()
        removeEventListener("submit", addBook)
        removeEventListener("click", cancelButton)
    })

    form.addEventListener("submit", async (e) => {
        e.preventDefault()
        const newBookData = {
            title: titleInput.value,
            description: descriptionInput.value,
            author: newAuthorInput.value || authorInput.value,
            year: parseInt(yearInput.value)
        }
        await addBook(newBookData)
        form.remove()
        removeEventListener("submit", addBook)
        removeEventListener("click", cancelButton)
    })

    form.appendChild(titleLabel)
    form.appendChild(titleInput)
    form.appendChild(descriptionLabel)
    form.appendChild(descriptionInput)
    form.appendChild(authorLabel)
    form.appendChild(authorInput)
    form.appendChild(newAuthorInput)
    form.appendChild(yearLabel)
    form.appendChild(yearInput)
    form.appendChild(addButton)
    form.appendChild(cancelButton)
    app.prepend(form)
}

async function addBook(bookData) {
    try {
        let newAuthor = null
        const author = await getAuthorByName(bookData.author)
        if (!author) {
            newAuthor = await addAuthor(bookData.author)
        }

        const book = {
            title: bookData.title,
            description: bookData.description,
            author: author ? author.id : newAuthor.id,
            year: bookData.year
        }

        const response = await fetch("http://localhost:3000/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(book)
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Failed to add book")
        }

        console.log("Book added:", data)

        await addBookToAuthor(data)
        getBooks()
    } catch (error) {
        console.error("Error adding book:", error)
    }
}

async function createEditForm(book, bookElement) {
    const form = document.createElement("form")
    form.classList.add("edit-form")

    const titleElement = document.createElement("h3");
    titleElement.textContent = "Title:";

    const titleInput = document.createElement("input")
    titleInput.type = "text"
    titleInput.value = book.title

    const descriptionElement = document.createElement("h3");
    descriptionElement.textContent = "Description:";

    const descriptionInput = document.createElement("textarea")
    descriptionInput.value = book.description

    const authorElement = document.createElement("h3");
    authorElement.textContent = "Author:";

    const authorInput = document.createElement("select")
    const authors = await fetch("http://localhost:3000/authors").then(res => res.json())
    authors.forEach(author => {
        const option = document.createElement("option")
        option.value = author.name
        option.textContent = author.name
        if (author.id === book.author) {
            option.selected = true
        }
        authorInput.appendChild(option)
    })

    const newAuthorInput = document.createElement("input")
    newAuthorInput.type = "text"
    newAuthorInput.placeholder = "Or enter new author"

    const yearElement = document.createElement("h3");
    yearElement.textContent = "Year:";

    const yearInput = document.createElement("input")
    yearInput.type = "number"
    yearInput.value = book.year

    const saveButton = document.createElement("button")
    saveButton.textContent = "Save"
    saveButton.type = "submit"



    const cancelButton = document.createElement("button")
    cancelButton.textContent = "Cancel"
    cancelButton.type = "button"
    cancelButton.addEventListener("click", () => {
        form.remove()
        getBooks()
    })

    form.addEventListener("submit", async (e) => {
        e.preventDefault()
        let selectedAuthor = authors.find(author => author.name === authorInput.value)
        if (newAuthorInput.value) {
            selectedAuthor = await addAuthor(newAuthorInput.value)
        }
        const updatedData = {
            title: titleInput.value,
            description: descriptionInput.value,
            author: selectedAuthor.id,
            year: parseInt(yearInput.value)
        }
        if (selectedAuthor.id !== book.author) {
            await removeBookFromAuthor(book)
            await addBookToAuthor({ ...updatedData, id: book.id })
        }
        await updateBook(book.id, updatedData)
        form.remove()
    })

    form.appendChild(titleElement)
    form.appendChild(titleInput)
    form.appendChild(descriptionElement)
    form.appendChild(descriptionInput)
    form.appendChild(authorElement)
    form.appendChild(authorInput)
    form.appendChild(newAuthorInput)
    form.appendChild(yearElement)
    form.appendChild(yearInput)
    form.appendChild(saveButton)
    form.appendChild(cancelButton)

    bookElement.innerHTML = ""
    bookElement.appendChild(form)

}

async function deleteBook(id) {
    try {
        const response = await fetch(`http://localhost:3000/books/${id}`, {
            method: "DELETE"
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete book")
        }
        removeBookFromAuthor(data)

        console.log("Book deleted:", data)
        getBooks()
    }
    catch (error) {
        console.error("Error deleting book:", error)
    }
}

async function updateBook(id, updatedData) {
    try {
        const response = await fetch(`http://localhost:3000/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || "Failed to update book")
        }
        getBooks()
    }
    catch (error) {
        console.error("Error updating book:", error)
    }
}






async function getAuthorByName(name) {
    try {
        const response = await fetch("http://localhost:3000/authors")
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch authors")
        }
        console.log("Authors fetched:", data)
        const author = data.find(author => author.name === name)
        return author ? author : null
    } catch (error) {
        console.error("Error fetching authors:", error)
        return null
    }
}

async function getAuthorById(id) {
    try {
        const response = await fetch(`http://localhost:3000/authors/${id}`)
        const data = await response.json()
        console.log("Author fetched by ID:", data)
        return data
    } catch (error) {
        console.error("Error fetching author:", error)
        return null

    }
}

async function addAuthor(name) {
    try {
        const response = await fetch("http://localhost:3000/authors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                books: []
            })
        })
        const newAuthor = await response.json()
        if (!response.ok) {
            throw new Error(newAuthor.message || "Failed to add author")
        }
        console.log("Author added:", newAuthor)
        return newAuthor
    } catch (error) {
        console.error("Error adding author:", error)
        return null
    }
}

function deleteAuthor() {

}

async function addBookToAuthor(bookData) {
    try {
        console.log("Adding book to author with data:", bookData)
        const getResponse = await getAuthorById(bookData.author)
        if (!getResponse) {
            throw new Error("Author not found")
        }

        const books = getResponse.books || []
        if (!books.includes(bookData.id)) {
            books.push(bookData.id)
        }
        console.log("Updated books array for author:", books)

        const response = await fetch(`http://localhost:3000/authors/${getResponse.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: getResponse.name,
                books: books,
            })
        })
        const updatedAuthor = await response.json()

        console.log("Book added to author:", updatedAuthor)
    }
    catch (error) {
        console.error("Error updating author:", error)
    }
}

async function removeBookFromAuthor(bookData) {
    console.log("Removing book from author with data:", bookData)
    try {
        const getResponse = await getAuthorById(bookData.author)
        if (!getResponse) {
            throw new Error("Author not found")
        }

        const books = getResponse.books || []
        if (!books.includes(bookData.id)) {
            throw new Error("Book not found in author's list")
        }

        const updatedBooks = books.filter(id => id !== bookData.id)

        const response = await fetch(`http://localhost:3000/authors/${getResponse.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: getResponse.name,
                books: updatedBooks,
            })
        })
        const updatedAuthor = await response.json()

        console.log("Book removed from author:", updatedAuthor)

    }
    catch (error) {
        console.error("Error updating author:", error)
    }
}


getBooks()