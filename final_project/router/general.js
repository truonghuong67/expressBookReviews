const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// ---------------------------------------------------------------
// Tasks 1-6: general user routes (synchronous implementation)
// ---------------------------------------------------------------

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    }
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const result = Object.keys(books)
        .filter((key) => books[key].author.toLowerCase() === author)
        .map((key) => ({ isbn: key, ...books[key] }));

    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
    }
    return res.status(404).json({ message: "No books found for this author" });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const result = Object.keys(books)
        .filter((key) => books[key].title.toLowerCase() === title)
        .map((key) => ({ isbn: key, ...books[key] }));

    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
    }
    return res.status(404).json({ message: "No books found with this title" });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    const reviews = books[isbn].reviews;
    if (Object.keys(reviews).length === 0) {
        return res.status(200).json({ message: "No reviews found for this book." });
    }
    return res.status(200).send(JSON.stringify(reviews, null, 4));
});

// ---------------------------------------------------------------
// Tasks 10-13: Axios clients using Promise callbacks / async-await
// ---------------------------------------------------------------

// Task 10: Get all books  -- Promise callbacks with Axios
const getAllBooks = () => {
    return axios.get(`${BASE_URL}/`)
        .then((response) => response.data)
        .catch((error) => { throw new Error("Unable to get book list: " + error.message); });
};

// Task 11: Get book by ISBN -- Promise callbacks with Axios
const getBookByISBN = (isbn) => {
    return axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
        .then((response) => response.data)
        .catch((error) => { throw new Error("Unable to get book by ISBN: " + error.message); });
};

// Task 12: Get books by author -- async/await with Axios
const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        throw new Error("Unable to get books by author: " + error.message);
    }
};

// Task 13: Get books by title -- async/await with Axios
const getBooksByTitle = async (title) => {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
        return response.data;
    } catch (error) {
        throw new Error("Unable to get books by title: " + error.message);
    }
};

// Routes that exercise the Axios functions above
public_users.get('/async/books', (req, res) => {
    getAllBooks()
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(500).json({ message: err.message }));
});

public_users.get('/async/isbn/:isbn', (req, res) => {
    getBookByISBN(req.params.isbn)
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(500).json({ message: err.message }));
});

public_users.get('/async/author/:author', async (req, res) => {
    try {
        const data = await getBooksByAuthor(req.params.author);
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

public_users.get('/async/title/:title', async (req, res) => {
    try {
        const data = await getBooksByTitle(req.params.title);
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports.general = public_users;
