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
    const [users] = await pool.query("SELECT * FROM anura.users");

    // Debug (remove later if needed)
    console.log(users);
    return users  
}

//Cambue a getUser por id a getUSer por nombre o username
export async function getUsersById(username) { 
    const [user] = await pool.query("SELECT * FROM anura.users WHERE username = ?", [username]);

    // Debug (remove later if needed)
    console.log(user);
    return user;
}

export async function createUser(username,email,password){
    const[new_user] = await pool.query(`
        INSERT INTO anura.users (username, email, password)
        VALUES (?,?,?);
        `,[username,email,password]);

    const result = new_user.insertId
    console.log(result);
    return result;

}

export async function getSessionById(id){
    const [user] = await pool.query("SELECT * FROM anura.sessions WHERE session_user_id = ?", [id]);

    // Debug (remove later if needed)
    console.log(user);
    return user;
}


export async function startSession(user_id){
    // insert a new session for this user and get back the new session's id
    const [result] = await pool.query(`
        INSERT INTO anura.sessions (session_user_id)
        VALUES (?);
        `,[user_id]);

    const sessions = await getSessionById(user_id); // getSessionById returns ALL sessions for that user, not the new one
    const newSessionId = sessions[sessions.length - 1].session_id; // we must grab the most recent session id
    console.log("New session created, ID:", newSessionId);
    return newSessionId;
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

export async function getRandomCards() {
    const [cards] = await pool.query("SELECT * FROM anura.cards ORDER BY RAND() LIMIT 3");
    return cards;
}

// getAllCards() -> returns all cards from the database so the frontend can load them with their IDs
export async function getAllCards() {
    const [cards] = await pool.query("SELECT * FROM anura.cards");
    console.log(cards);
    return cards;
}

// addMosquitoesToUser(session_id, mosquitoes) -> adds the mosquitoes collected in this run to the player's all time total, its calculated with a JOIN across sessions + runs
// given a session_id, returns the lifetime mosquito total for the owner of that session, they're stored per run in mosquitoes_collected so to get the lifetime amount you have to add up all runs across all sessions for that user
// the view does the sum per session
export async function getTotalMosquitoesBySession(session_id) {
    const [rows] = await pool.query(`
        SELECT X.session_user_id, Y.username, SUM(Z.mosquitoesPerSession) AS mosquitoes_total
        FROM anura.sessions AS X INNER JOIN mosquitoesPerSessionView AS Z
        USING (session_id)
        INNER JOIN anura.users AS Y
        ON session_user_id = user_id
        WHERE X.session_id = ? 
        GROUP BY user_id`
        , [session_id]);

        console.log("Total mosquitoes for session", session_id, ":", rows[0]);
        return rows[0] ?? null; // returns { session_user_id, username, mosquitoes_total }
}

// updateDeck(session_id, cardIds) -> replaces the player's saved deck in character_deck
// cards already come with their IDs from the database via GET /cards/all
// get user_id from session_id -> get user_character_id from user_character -> delete old deck -> insert new deck

export async function updateDeck(session_id, cardIds) {
    
    // getting user id from the session
    const [sessionRows] = await pool.query("SELECT session_user_id FROM anura.sessions WHERE session_id = ?", [session_id]);

    if (!sessionRows.length) {
        throw new Error(`No session found for session_id: ${session_id}`);
    }

    const user_id = sessionRows[0].session_user_id;

    // getting character_id directly from playable character using pc_user_id, changed this since we removed the user_character table in the new schema
    const[characterRows] = await pool.query("SELECT character_id FROM anura.playable_character WHERE pc_user_id = ?", [user_id]);

    if (!characterRows.length) {
        throw new Error(`No character found for user_id: ${user_id}`);
    }

    const character_id = characterRows[0].character_id;

    // delete old deck
    await pool.query("DELETE FROM anura.character_deck WHERE cd_character_id = ?", [character_id]);

    // insert new deck
    for (const card_id of cardIds) {
        await pool.query("INSERT INTO anura.character_deck (cd_card_id, cd_character_id) VALUES (?, ?)", [card_id, character_id]);
    }

    console.log("Deck updated for character_id:", character_id, " cards saved:", cardIds.length);
    return { character_id, cardsInserted: cardIds.length };
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


