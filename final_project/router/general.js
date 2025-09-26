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
            return res.status(300).json({ "message": "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ "message": "Customer already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ "error": "Unable to register customer." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    let myPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 3000)
    })

    myPromise.then(booksPromise => {
        return res.status(300).json({"books":booksPromise});
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

    let myPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books[req.params.isbn]);
        }, 3000)
    })

    myPromise.then((bookFound) => {
        if (bookFound)
            return res.status(300).json(bookFound);
        else
            return res.status(404).json({ "error": "Book was not found" });
    })



});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const getByAuthor = () => {
        return new Promise((resolve, rejected) => {
            setTimeout(() => {
                const booksArray = Object.values(books);
                const booksFound = booksArray.filter(book => req.params.author === book.author);
                resolve(booksFound);
            }, 6000);
        });
    };

    try {
        let booksFound = await getByAuthor();
        if (booksFound.length > 0)
            return res.status(300).json({"booksByAuthor" : booksFound});
        else
            return res.status(404).json({ "error": "Book was not found" });
    } catch (error) {
        return res.status(505).json({ error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const getByTitle = () => {
        return new Promise((resolve, rejected) => {
            setTimeout(() => {
                const booksArray = Object.values(books);
                const booksFound = booksArray.filter(book => req.params.title === book.title);
                resolve(booksFound);
            }, 6000);
        });
    };

    try {
        let booksFound = await getByTitle();
        if (booksFound.length > 0)
            return res.status(300).json({ "booksByTitle": booksFound });
        else
            return res.status(404).json({ "error": "Book was not found" });

    } catch (error) {
        return res.status(505).json({ error });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const bookFound = books[req.params.isbn];
    if (bookFound) {
        return res.status(300).json({ "reviewsByIsbn": bookFound.reviews});
    }
    else
        return res.status(404).json({ "error": "Book was not found" });
});

module.exports.general = public_users;
