const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        "username": "rea",
        "password": "root1233"
    },
    {
        "username": "agurod",
        "password": "12345"
    }
];

const alreadyReviewed = (bookFound, username) => {
    const filteredReviews = bookFound.reviews.filter(review =>  review.username === username );
    if (filteredReviews.length > 0)
        return true;
    else
        return false;
}

const isValid = (username) => { //returns boolean
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

const authenticatedUser = (username, password) => { //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in. Login fields must not be empty." });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 30 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(300).send({ "message": "User successfully logged in" });
    } else {
        return res.status(208).json({ "error": "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    let bookFound = books[req.params.isbn];
    let review = req.query.review;
    let msg = "";
    if (bookFound && review) {
        if (alreadyReviewed(bookFound, username)) {
            bookFound.reviews.find(rev => rev.username === username).review = review;
            msg = `The book's review was succesfully updated to ${review}.`;
        }
        else {
            console.log("Review not found, addition");
            bookFound.reviews.push({ "username": username, "review": review });
            msg = `The book's review ${review} was succesfully added!`;
        }
        return res.status(300).json({ "message": msg });
    }
    else
        return res.status(404).json({ "error": "Book was not found or the review query was not passed." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    let bookFound = books[req.params.isbn];
    if (bookFound) {
        reviewDeleted = bookFound.reviews.find(rev => rev.username === username);
        bookFound.reviews = bookFound.reviews.filter(rev => rev.username !== username);
        if(reviewDeleted)
            return res.status(300).json({ "reviewDeleted":reviewDeleted});
        else
            return res.status(300).json({"error": "No review found for this customer."}); 
    }
    else
        return res.status(404).json({ "error": "Book was not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
