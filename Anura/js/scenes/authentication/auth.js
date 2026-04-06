/*

Temporary Backend for storing the list of users 

*/

"use strict";

// stores all registered accs
let users = []

// stores who is currently playing or active
// initialized with null because it is empty until someone logs in
let activeUser = null;
let activeUserId = null; // stores userId after login

let activeSessionId = null; // stores sessionId after login, used for creating runs

// username and password parameters
function registerUser(username, password) {
    // for each user in the array, check if that user's username property matched the username we passed in
    if (users.find(user => user.username === username)) {

        // using an object to return multiple pieces of info to the front end
        return { success: false, message: "Username already exists." };
    } else {
        users.push({ username: username, password: password });
        return { success: true, message: "Registration success." };
    };
}

function loginUser(username, password) {

    const user = users.find(user => user.username === username);
    
    // if user isnt found in the array
    if (!user) {
        return { success: false, message: "User not found. Please register."};
    } 
    
    // if the password matches the password associated with the username
    if (user.password === password) {
        activeUser = username;
        return { success: true, message: "Login successful." };
    } else {
        return { success: false, message: "Incorrect password." };
    }
};

/* TESTS
console.log(registerUser("Renata", "1234"));
console.log(registerUser("Renata", "1234")); // should fail cause it was created before
console.log(loginUser("Renata", "1234"));     // should succeed
console.log(loginUser("Renata", "lalalala")); // should fail
console.log(loginUser("unknown", "1234"));     // should fail
*/

// mu
/*
NOTES:

"==" (loose equality) checks if values are equal but ignore type ex. "1" == 1 would be true
"===" (strict equality) checks if values are equal and the same type ex. "1" === 1 would be false
using === is a good practice to avoid errors

*/
