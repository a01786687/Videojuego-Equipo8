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
    password: 'Cerplirp&130506',
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
    const [users] = await pool.query("SELECT * FROM anura.users");

    // Debug (remove later if needed)
    console.log(users);
    return users  
}

export async function getUsersById(id) { 
    const [user] = await pool.query("SELECT * FROM anura.users WHERE user_id = ?", [id]);

    // Debug (remove later if needed)
    console.log(user);
    return user;
}

export async function createUser(username,email,password){
    const[new_user] = await pool.query(`
        INSERT INTO anura.users (username, email, password)
        VALUES (?,?,?);
        `,[username,email,password]);

    const result = getUsersById(new_user.insertId)
    console.log(result);
    return result;

}

export async function getSessionById(id){
    const [user] = await pool.query("SELECT * FROM anura.sessions WHERE session_user_id = ?", [id]);

    // Debug (remove later if needed)
    console.log(user);
    return user;
}


export async function startSession(id){
    const [result] = await pool.query(`
        INSERT INTO anura.sessions (session_user_id)
        VALUES (?);
        `,[id]);

    const verify = getSessionById(id)
    console.log(verify);
    return verify;
}

// Probar esta primero
export async function saveRun(session_id,mosqCollect,bosses_defeated,victory,start_time){
    console.log(session_id);
    const [run] = await pool.query(`
        INSERT INTO anura.runs (run_session_id, mosquitoes_collected, bosses_defeated, victory, start_time)
        VALUES (?,?,?,?,?);
        `,[session_id,mosqCollect,bosses_defeated,victory,start_time]);

    const result = run.insertId;
    console.log(result);
    return result;
}

//Enemigos **Será de los primeros a probar en el javascript
export async function getMobData(name){
    const [mob_data] = await pool.query("SELECT * FROM anura.mobs WHERE mob_name = ?",[name]);

    console.log(mob_data);
    return mob_data;
}

export async function countRunsPerSession(){
    const [runs] = await pool.query("SELECT * FROM anura.sampleView");

    console.log(runs);
    return runs;
}

// export async function addMosquitoes(id)

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


