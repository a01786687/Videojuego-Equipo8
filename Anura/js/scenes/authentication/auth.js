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
async function apiRegister(username, email,password ) {
    // for each user in the array, check if that user's username property matched the username we passed in
    let res = await fetch(`http://localhost:8080/user/${username}`);
    const user = await res.json();
    
    if (user.length == 0) {

        res = await fetch ("http://localhost:8080/createUser",{
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({
                new_username: username,
                new_email: email,
                new_password: password
            })
        });
        
        return { success: true, message: "Registration success." }; // using an object to return multiple pieces of info to the front end
        
    } 
    else {
        return { success: false, message: "Username already exists." };
        
    };
}

async function apiLogin(front_username, front_password) {

    const res = await fetch(`http://localhost:8080/user/${front_username}`);
    const user = await res.json();
    // if user isnt found in the array
    
    if (user.length == 0) {
        return { success: false, message: "User not found. Please register."};
    } 
    else{

        if (user[0].password == front_password) {
            // added user_id so the loginScene knows who the user is
            return { success: true, message: "Login successful.", user_id: user[0].user_id };
        } 
        else {
            return { success: false, message: "Incorrect password." };
        }
    }
    // if the password matches the password associated with the username
        
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
