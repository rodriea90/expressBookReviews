const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(300).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

let myPromise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(books);
    }, 6000)
})

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    myPromise1.then(booksPromise => {
        return res.status(300).json({ message: "Books available: " + JSON.stringify(booksPromise) });
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    myPromise1.then((booksPromise) => {
    const bookFound = booksPromise[req.params.isbn];
    })

    if (bookFound)
        return res.status(300).json({ message: `Book with ISBN = ${req.params.isbn}: ${JSON.stringify(bookFound)}` });
    else
        return res.status(404).json({ message: "Book was not found" });
    
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const booksArray = Object.values(books);
    const booksFound = booksArray.filter(book => req.params.author === book.author);
    if (booksFound.length > 0)
        return res.status(300).json({ message: `Book written by author = ${req.params.author}: ${JSON.stringify(booksFound)}` });
    else
        return res.status(404).json({ message: "Book was not found" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const booksArray = Object.values(books);
    const booksFound = booksArray.filter(book => req.params.title === book.title);
    if (booksFound.length > 0)
        return res.status(300).json({ message: `Book with title = ${req.params.title}: ${JSON.stringify(booksFound)}` });
    else
        return res.status(404).json({ message: "Book was not found" });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const bookFound = books[req.params.isbn];
    if (bookFound) {
        return res.status(300).json({ message: `Reviews of book with ISBN ${req.params.isbn}: ${JSON.stringify(bookFound.reviews)}` });
    }
    else
        return res.status(404).json({ message: "Book was not found" });
});

module.exports.general = public_users;
