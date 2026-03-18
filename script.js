document.getElementById("add-book").addEventListener("click", (e) => {
    e.preventDefault()
    addBook()
})
document.getElementById("get-books").addEventListener("click", (e) => {
    e.preventDefault()
    getBooks()
})
const bookContainer = document.getElementById("bookContainer")

function updateBookContainer(books) {
    bookContainer.innerHTML = "";
    books.forEach(book => {
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

        const authorValue = document.createElement("p");
        authorValue.textContent = book.author;

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
    })
}


async function getBooks() {
    await fetch("http://localhost:3000/books")
        .then(response => response.json())
        .then(data => {
            console.log(data)
            updateBookContainer(data)
        })
        .catch(error => {
            console.error("Error fetching books:", error)
        })
}

async function addBook() {
    try {
        const author = await getAuthorByName("F. Scott Fitzgerald")
        if (!author) {
            throw new Error("Author ID not found for F. Scott Fitzgerald")
        }

        const response = await fetch("http://localhost:3000/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: "The Great Gatsby",
                description: `Generally considered to be F. Scott Fitzgerald's finest novel, The Great Gatsby is a consummate summary of the "roaring twenties", and a devastating expose of the "Jazz Age". Through the narration of Nick Carraway, the reader is taken into the superficially glittering world of the mansions which lined the Long Island shore in the 1920s, to encounter Nick's cousin Daisy, her brash but wealthy husband Tom Buchanan, Jay Gatsby and the mystery that surrounds him.`,
                author: author.name,
                year: 1925
            })
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
        if (author.name === book.author) {
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
        const updatedData = {
            title: titleInput.value,
            description: descriptionInput.value,
            author: authorInput.value || newAuthorInput.value,
            year: parseInt(yearInput.value)
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
        response = await fetch(`http://localhost:3000/books/${id}`, {
            method: "DELETE"
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete book")
        }

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
        console.log("Authors fetched:", data)
        const author = data.find(author => author.name === name)
        return author ? author : null
    } catch (error) {
        console.error("Error fetching authors:", error)
        return null
    }
}

async function addAuthor() {

}

function deleteAuthor() {

}

async function addBookToAuthor(data) {
    try {
        const getResponse = await getAuthorByName("F. Scott Fitzgerald")
        if (!getResponse) {
            throw new Error("Author not found for F. Scott Fitzgerald")
        }

        const books = getResponse.books || []
        if (!books.includes(data.title)) {
            books.push(data.title)
        }

        const response = await fetch(`http://localhost:3000/authors/${getResponse.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "F. Scott Fitzgerald",
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


getBooks()