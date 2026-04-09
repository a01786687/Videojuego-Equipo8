/*
 db.js

 Database layer for Anura.

 Responsibilities:
 - Establish connection to MySQL
 - Manage connection pooling (reuse connections efficiently)
 - Define and export query functions

 Rules:
 - Only database logic here
 - No Express or routes
 */

import mysql from 'mysql2'
import dotenv from 'dotenv'

// Load environment variables (for future use like DB credentials)
dotenv.config()

// --- DATABASE CONNECTION ---

/*
We use a connection pool instead of a single connection.

 Why?
 - Reuses connections -> faster
 - Handles multiple requests at the same time
 - Avoids opening a new connection for every query
*/

const pool = mysql.createPool({
    host: '127.0.0.1', // localhost
    user: 'root',
    password: '',
    database: 'anura'
}).promise() // promise -> enables async/await

// --- QUERY FUNCTIONS ---

/*
 getUsers()

 Gets all users from the database

 Returns:
 - Array of users
*/

export async function getUsers() { // export so it can be read from a diff file
    const [users] = await pool.query("SELECT * FROM users");

    // Debug (remove later if needed)
    console.log(users);
    return users
        
}

/*
 FUTURE FUNCTIONS:

 - getUserById(id)
 - createUser(data)
 - updateUser(id, data)
 - deleteUser(id)

 Keep all SQL queries in this file


 NOTES:

 - `.promise()` lets us use async/await instead of callbacks

 - We do NOT need `connection.connect()` because the pool handles it automatically:
   - opens a connection when needed
   - reuses connections
   - supports multiple requests at the same time

 - Using a pool = better performance and cleaner code
*/


