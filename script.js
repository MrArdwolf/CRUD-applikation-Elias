document.getElementById("add-book").addEventListener("click", (e) => {
    e.preventDefault();
    createAddForm();
})
const bookContainer = document.getElementById("bookContainer");
const app = document.getElementById("app");
const topButtonContainer = document.getElementById("buttons");

function errorAlert(message) {
    const alertContainer = document.createElement("div");
    alertContainer.classList.add("alert")
    const alert = document.createElement("p");
    alert.textContent = message;
    alertContainer.appendChild(alert);
    app.prepend(alertContainer)
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}

async function updateBookContainer(books, authorPage) {
    while (bookContainer.firstChild) {
        bookContainer.removeChild(bookContainer.firstChild);
    }

    if (authorPage) {
        if (!document.getElementById("back-button")) {
            const backButton = document.createElement("button");
            backButton.classList.add("working-button");
            backButton.id = "back-button";
            backButton.textContent = "Back";
            topButtonContainer.prepend(backButton);
            backButton.addEventListener("click", () => {
                getBooks(backButton);
                removeEventListener("click", backButton);
            })
        }

    }

    for (const book of books) {
        try {
            const bookElement = document.createElement("div");
            bookElement.classList.add("book");

            const titleContainer = document.createElement("div");
            titleContainer.classList = ("book-title book-row");

            const titleElement = document.createElement("h3");
            titleElement.textContent = "Title:";

            const titleValue = document.createElement("p");
            titleValue.textContent = book.title;

            const descriptionContainer = document.createElement("div");
            descriptionContainer.classList = ("book-description book-row");

            const descriptionElement = document.createElement("h3");
            descriptionElement.textContent = "Description:";

            const descriptionValue = document.createElement("p");
            descriptionValue.textContent = book.description;

            const authorContainer = document.createElement("div");
            authorContainer.classList = ("book-author book-row");

            const authorElement = document.createElement("h3");
            authorElement.textContent = "Author:";

            const author = await getAuthorById(book.author);

            const authorValue = document.createElement("p");
            authorValue.textContent = author ? author.name : "Unknown";
            if (author) {
                authorValue.addEventListener("click", async () => {
                    await getBooksByAuthor(author.id);
                });
            }

            const yearContainer = document.createElement("div");
            yearContainer.classList = ("book-year book-row");

            const yearElement = document.createElement("h3");
            yearElement.textContent = "Year:";

            const yearValue = document.createElement("p");
            yearValue.textContent = book.year;

            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("book-buttons");

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("error-button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                deleteBook(book.id);
            })

            const editButton = document.createElement("button");
            editButton.classList.add("working-button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => {
                createEditForm(book, bookElement);
            })

            titleContainer.appendChild(titleElement);
            titleContainer.appendChild(titleValue);
            bookElement.appendChild(titleContainer);
            descriptionContainer.appendChild(descriptionElement);
            descriptionContainer.appendChild(descriptionValue);
            bookElement.appendChild(descriptionContainer);
            authorContainer.appendChild(authorElement);
            authorContainer.appendChild(authorValue);
            bookElement.appendChild(authorContainer);
            yearContainer.appendChild(yearElement);
            yearContainer.appendChild(yearValue);
            bookElement.appendChild(yearContainer);
            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(editButton);
            bookElement.appendChild(buttonContainer);
            bookContainer.appendChild(bookElement);
        } catch (error) {
            console.error("Error creating book element:", error);
            errorAlert("Error creating book element")
        }
    }
}


async function getBooks(backButton) {
    if (backButton) backButton.remove();
    try {
        const response = await fetch("http://localhost:3000/books");
        const data = await response.json();
        await updateBookContainer(data);
        return data;
    } catch (error) {
        console.error("Error fetching books:", error);
        errorAlert("Error fetching books")
    }
}

async function getBookById(id) {
    try {
        const response = await fetch(`http://localhost:3000/books/${id}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching book by ID:", error);
        errorAlert("Error fetching book by ID")
    }
}

async function getBooksByAuthor(author) {
    try {
        const authorData = await getAuthorById(author);
        if (!authorData) {
            throw new Error("Author not found");
        }
        const bookdata = await Promise.all(authorData.books.map(bookId => getBookById(bookId)));
        await updateBookContainer(bookdata, true);
    } catch (error) {
        console.error("Error fetching books by author:", error);
        errorAlert("Error fetching books by author")
    }
}

async function createAddForm() {
    try {
    const formBackground = document.createElement("div");
    formBackground.classList.add("form-back");


    const form = document.createElement("form");
    form.classList.add("add-form");

    const leftColumn = document.createElement("div");
    leftColumn.classList.add("left-column");

    const titleContainer = document.createElement("div");
    titleContainer.classList.add("book-row");

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Title:";
    titleLabel.htmlFor = "title";

    const titleInput = document.createElement("input");
    titleInput.classList.add("input-text");
    titleInput.type = "text";
    titleInput.required = true;
    titleInput.placeholder = "Enter book title";
    titleInput.id = "title";

    const descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("book-row");
    descriptionContainer.classList.add("book-description");

    const descriptionLabel = document.createElement("label");
    descriptionLabel.textContent = "Description:";
    descriptionLabel.htmlFor = "description";

    const descriptionInput = document.createElement("textarea");
    descriptionInput.classList.add("input-textarea");
    descriptionInput.required = true;
    descriptionInput.placeholder = "Enter book description";
    descriptionInput.id = "description";

    const rightColumn = document.createElement("div");
    rightColumn.classList.add("right-column");

    const authorContainer = document.createElement("div");
    authorContainer.classList.add("book-row");

    const authorLabel = document.createElement("label");
    authorLabel.textContent = "Author:";
    authorLabel.htmlFor = "author";

    const authorInput = document.createElement("select");
    authorInput.required = true;
    authorInput.id = "author";

    const authors = await fetch("http://localhost:3000/authors").then(res => res.json());
    authors.forEach(author => {
        const option = document.createElement("option");
        option.value = author.name;
        option.textContent = author.name;
        authorInput.appendChild(option);
    })

    const newAuthorInput = document.createElement("input");
    newAuthorInput.classList.add("input-text");
    newAuthorInput.type = "text";
    newAuthorInput.placeholder = "Or enter new author";
    newAuthorInput.id = "newAuthor";

    const yearContainer = document.createElement("div");
    yearContainer.classList.add("book-row");

    const yearLabel = document.createElement("label");
    yearLabel.textContent = "Year:";
    yearLabel.htmlFor = "year";

    const yearInput = document.createElement("input");
    yearInput.required = true;
    yearInput.placeholder = "Enter publication year";
    yearInput.classList.add("input-number");
    yearInput.type = "number";
    yearInput.id = "year";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("add-buttons");

    const addButton = document.createElement("button");
    addButton.classList.add("primary-button");
    addButton.textContent = "Add";
    addButton.type = "submit";

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("working-button");
    cancelButton.textContent = "Cancel";
    cancelButton.type = "button";
    cancelButton.addEventListener("click", () => {
        form.remove();
        formBackground.remove();
        removeEventListener("submit", addBook);
        removeEventListener("click", cancelButton);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newBookData = {
            title: titleInput.value,
            description: descriptionInput.value,
            author: newAuthorInput.value || authorInput.value,
            year: parseInt(yearInput.value)
        };
        await addBook(newBookData);
        form.remove();
        formBackground.remove();
        removeEventListener("submit", addBook);
        removeEventListener("click", cancelButton);
    });

    app.appendChild(formBackground);
    form.appendChild(leftColumn);
    leftColumn.appendChild(titleContainer);
    titleContainer.appendChild(titleLabel);
    titleContainer.appendChild(titleInput);
    leftColumn.appendChild(descriptionContainer);
    descriptionContainer.appendChild(descriptionLabel);
    descriptionContainer.appendChild(descriptionInput);
    form.appendChild(rightColumn);
    rightColumn.appendChild(authorContainer);
    authorContainer.appendChild(authorLabel);
    authorContainer.appendChild(authorInput);
    authorContainer.appendChild(newAuthorInput);
    rightColumn.appendChild(yearContainer);
    yearContainer.appendChild(yearLabel);
    yearContainer.appendChild(yearInput);
    rightColumn.appendChild(buttonContainer);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(addButton);
    app.prepend(form);
        
    } catch (error) {
        console.error("Error creating add book form", error)
        errorAlert("Error creating add book form")
    }
};

async function addBook(bookData) {
    try {
        let newAuthor = null;
        const author = await getAuthorByName(bookData.author);
        if (!author) {
            newAuthor = await addAuthor(bookData.author);
        };

        const book = {
            title: bookData.title,
            description: bookData.description,
            author: author ? author.id : newAuthor.id,
            year: bookData.year
        };

        const response = await fetch("http://localhost:3000/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(book)
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to add book");
        }


        await addBookToAuthor(data);
        getBooks();
    } catch (error) {
        console.error("Error adding book:", error);
        errorAlert("Error adding book")
    };
};

async function createEditForm(book, bookElement) {
    try {
    const form = document.createElement("form");
    form.classList.add("edit-form");

    const titleContainer = document.createElement("div");
    titleContainer.classList = ("edit-title book-row");

    const titleElement = document.createElement("h3");
    titleElement.textContent = "Title:";

    const titleInput = document.createElement("input");
    titleInput.classList.add("input-text");
    titleInput.type = "text";
    titleInput.value = book.title;

    const descriptionContainer = document.createElement("div");
    descriptionContainer.classList = ("edit-description book-row");

    const descriptionElement = document.createElement("h3");
    descriptionElement.textContent = "Description:";

    const descriptionInput = document.createElement("textarea");
    descriptionInput.classList.add("input-textarea");
    descriptionInput.value = book.description;

    const authorContainer = document.createElement("div");
    authorContainer.classList = ("edit-author book-row");

    const authorElement = document.createElement("h3");
    authorElement.textContent = "Author:";

    const authorInput = document.createElement("select");
    const authors = await fetch("http://localhost:3000/authors").then(res => res.json());
    authors.forEach(author => {
        const option = document.createElement("option");
        option.value = author.name;
        option.textContent = author.name;
        if (author.id === book.author) {
            option.selected = true;
        };
        authorInput.appendChild(option);
    });

    const newAuthorInput = document.createElement("input");
    newAuthorInput.classList.add("input-text");
    newAuthorInput.type = "text";
    newAuthorInput.placeholder = "Or enter new author";

    const yearContainer = document.createElement("div");
    yearContainer.classList = ("edit-year book-row");

    const yearElement = document.createElement("h3");
    yearElement.textContent = "Year:";

    const yearInput = document.createElement("input");
    yearInput.classList.add("input-number");
    yearInput.type = "number";
    yearInput.value = book.year;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("edit-buttons");

    const saveButton = document.createElement("button");
    saveButton.classList.add("primary-button");
    saveButton.textContent = "Save";
    saveButton.type = "submit";

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("working-button");
    cancelButton.textContent = "Cancel";
    cancelButton.type = "button";
    cancelButton.addEventListener("click", () => {
        form.remove();
        getBooks();
    })

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        let selectedAuthor = authors.find(author => author.name === authorInput.value);
        if (newAuthorInput.value) {
            selectedAuthor = await addAuthor(newAuthorInput.value);
        };
        const updatedData = {
            title: titleInput.value,
            description: descriptionInput.value,
            author: selectedAuthor.id,
            year: parseInt(yearInput.value)
        };
        if (selectedAuthor.id !== book.author) {
            await removeBookFromAuthor(book);
            await addBookToAuthor({ ...updatedData, id: book.id });
        };
        await updateBook(book.id, updatedData);
        form.remove();
    })

    form.appendChild(titleContainer);
    titleContainer.appendChild(titleElement);
    titleContainer.appendChild(titleInput);
    form.appendChild(descriptionContainer);
    descriptionContainer.appendChild(descriptionElement);
    descriptionContainer.appendChild(descriptionInput);
    form.appendChild(authorContainer);
    authorContainer.appendChild(authorElement);
    authorContainer.appendChild(authorInput);
    form.appendChild(newAuthorInput);
    form.appendChild(yearContainer);
    yearContainer.appendChild(yearElement);
    yearContainer.appendChild(yearInput);
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);
    form.appendChild(buttonContainer);

    bookElement.innerHTML = "";
    bookElement.appendChild(form);
} catch (error) {
    console.error("Error creating edit form", error)
        errorAlert("Error creating edit form")
}

};

async function deleteBook(id) {
    try {
        const response = await fetch(`http://localhost:3000/books/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete book");
        };
        removeBookFromAuthor(data);

        getBooks();
    }
    catch (error) {
        console.error("Error deleting book:", error);
        errorAlert("Error deleting book")
    };
};

async function updateBook(id, updatedData) {
    try {
        const response = await fetch(`http://localhost:3000/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to update book");
        };
        getBooks();
    }
    catch (error) {
        console.error("Error updating book:", error);
        errorAlert("Error updating book")
    };
}






async function getAuthorByName(name) {
    try {
        const response = await fetch("http://localhost:3000/authors");
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch authors");
        };
        const author = data.find(author => author.name === name);
        return author ? author : null;
    } catch (error) {
        console.error("Error fetching authors:", error);
        errorAlert("Error fetching authors")
    };
}

async function getAuthorById(id) {
    try {
        const response = await fetch(`http://localhost:3000/authors/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching author:", error);
        errorAlert("Error fetching author by id")

    };
};

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
        });
        const newAuthor = await response.json();
        if (!response.ok) {
            throw new Error(newAuthor.message || "Failed to add author");
        };
        return newAuthor;
    } catch (error) {
        console.error("Error adding author:", error);
        errorAlert("Error adding author")
    };
};

async function deleteAuthor(id) {
    try {
        const response = await fetch(`http://localhost:3000/authors/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to delete author");
        };

    } catch (error) {
        console.error("Error removing author", error)
        errorAlert("Error removing author")
    }

}

async function addBookToAuthor(bookData) {
    try {
        const getResponse = await getAuthorById(bookData.author);
        if (!getResponse) {
            throw new Error("Author not found");
        };

        const books = getResponse.books || [];
        if (!books.includes(bookData.id)) {
            books.push(bookData.id);
        };

        const response = await fetch(`http://localhost:3000/authors/${getResponse.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: getResponse.name,
                books: books,
            })
        });
        const updatedAuthor = await response.json();

    }
    catch (error) {
        console.error("Error updating author:", error);
        errorAlert("Error updating author")
    };
};

async function removeBookFromAuthor(bookData) {
    try {
        const getResponse = await getAuthorById(bookData.author);
        if (!getResponse) {
            throw new Error("Author not found");
        };

        const books = getResponse.books || [];
        if (!books.includes(bookData.id)) {
            throw new Error("Book not found in author's list");
        };

        const updatedBooks = books.filter(id => id !== bookData.id);

        const response = await fetch(`http://localhost:3000/authors/${getResponse.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: getResponse.name,
                books: updatedBooks,
            })
        });
        const updatedAuthor = await response.json();


        if (updatedAuthor.books.length === 0) {
            deleteAuthor(updatedAuthor.id)
        }

    }
    catch (error) {
        console.error("Error updating author:", error);
        errorAlert("Error updating author")
    };
};


getBooks();