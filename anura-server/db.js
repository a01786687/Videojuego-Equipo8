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
    password: '#Clifjumper4406',
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
    const [user] = await pool.query("SELECT * FROM anura.sessions WHERE session_id = ?", [id]);

    // Debug (remove later if needed)
    console.log(user);
    return user;
}

//New quert to get recent session from a user
export async function getNewSessionById(id){
    const [user] = await pool.query(`SELECT * FROM sessions 
    WHERE session_user_id = ? 
    AND login_time = (SELECT MAX(login_time) FROM sessions 
    WHERE session_user_id = ?);`, [id,id]);

    // Debug (remove later if needed)
    //console.log(user[0].session_id);
    return user;
}


export async function startSession(user_id){
    // insert a new session for this user and get back the new session's id
    const [result] = await pool.query(`
        INSERT INTO anura.sessions (session_user_id)
        VALUES (?);
        `,[user_id]);

    const sessions = await getNewSessionById(user_id); // getSessionById returns ALL sessions for that user, not the new one
    const newSessionId = sessions[0].session_id; // we must grab the most recent session id
    console.log("New session created, ID:", newSessionId);
    return newSessionId;
}

//Creamos start run para poder marcar un tiempo inicial
export async function startRun(session_id){
    const [save] = await pool.query(`INSERT INTO runs(run_session_id, start_time)
    VALUES (?,NOW());`,[session_id]);

    const result = save.insertId;
    console.log("Run started, run_id: ", result);
    return result;
}

// Probar esta primero
export async function saveRun(run_id,mosqCollect,bosses_defeated,victory){
    const [run] = await pool.query("CALL saveRun (?,?,?,?);",[run_id,mosqCollect,bosses_defeated,victory]);

    console.log(run);
    return run;
}

export async function boughtCard(cost, session_id){
    const [update_currency] = await pool.query("CALL boughtCard(?, ?)",[cost,session_id]);

    console.log("En backend?...", update_currency);
    return update_currency;
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

// getDeck(session_id) -> returns all cards saved in the player's deck for this session, it uses the deckBySession view which
// joins sessions, playable_character, character_deck and cards
export async function getDeck(session_id) {
    const [cards] = await pool.query("SELECT * FROM anura.deckBySession WHERE session_id = ?",[session_id]);
    console.log("Deck loaded for session", session_id, ":", cards.length, "cards");
    return cards;

}

// addCardToDeck(session_id, card_id) -> adds a card to the player's deck after purchasing it
export async function addCardToDeck(session_id, card_id) {
    const [sessionRows] = await pool.query("SELECT session_user_id FROM anura.sessions WHERE session_id = ?",[session_id]);
    const user_id = sessionRows[0].session_user_id;

    const[characterRows] = await pool.query("SELECT character_id FROM anura.playable_character WHERE pc_user_id = ?", [user_id]);
    const character_id = characterRows[0].character_id;

    await pool.query("INSERT INTO anura.character_deck (cd_card_id, cd_character_id) VALUES (?, ?)", [card_id, character_id]);
    
    console.log("Card", card_id, "added to deck for character_id:", character_id);
    return {success: true};
}

// addMosquitoesToUser(session_id, mosquitoes) -> adds the mosquitoes collected in this run to the player's all time total, its calculated with a JOIN across sessions + runs
// given a session_id, returns the lifetime mosquito total for the owner of that session, they're stored per run in mosquitoes_collected so to get the lifetime amount you have to add up all runs across all sessions for that user
// the view does the sum per session
export async function getTotalMosquitoesBySession(session_id) {
    const [rows] = await pool.query("SELECT * FROM mosquitoesPerSessionView WHERE session_id = ?;"
        , [session_id]);

        console.log("Total mosquitoes for session", session_id, ":", rows[0]);
        return rows[0] ?? null; // returns { session_user_id, username, mosquitoes_total }
}

// getTotalMosquitoesByUser(session_id) -> gets the total mosquitoes for the USER who owns this session
// sums mosquitoes across ALL sessions for that user (account-level persistence)
export async function getTotalMosquitoesByUser(session_id) {
    // First, get the user_id from the session
    const [sessionRows] = await pool.query(
        "SELECT session_user_id FROM sessions WHERE session_id = ?",
        [session_id]
    );
    
    if (!sessionRows.length) {
        console.log("No session found for session_id:", session_id);
        return null;
    }
    
    const user_id = sessionRows[0].session_user_id;
    
    // get the TOTAL mosquitoes across ALL sessions for this user
    const [rows] = await pool.query(
        "SELECT * FROM usersMosquitoes WHERE user_id = ?",
        [user_id]
    );

    console.log("Total mosquitoes for user", user_id, ":", rows[0]);
    return rows[0] ?? null; // returns { user_id, username, mosquitoes_total }
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

// FOR STATS

// getTotalRunsPerUser() returns the total runs played by each user, sorted by most active first, uses runsPerUser view
export async function getTotalRunsPerUser() {
    const [rows] = await pool.query(`
        SELECT username, totalRuns 
        FROM runsPerUser 
        ORDER BY totalRuns DESC 
        LIMIT 10;
    `);
    console.log(rows);
    return rows;
}

// getTotalMosquitoesPerUser() returns the total mosquitoes collected by each user across all runs USED FOR STATS
export async function getTotalMosquitoesPerUser() {
    const [rows] = await pool.query(`
        SELECT 
        U.username AS username,
        SUM(R.mosquitoes_collected) AS totalMosquitoes
        FROM runs AS R
        INNER JOIN sessions AS S ON R.run_session_id = S.session_id
        INNER JOIN users AS U ON S.session_user_id = U.user_id
        GROUP BY U.username
        ORDER BY totalMosquitoes DESC
        LIMIT 10;
        `);
        console.log(rows);
        return rows;
}

// INDIVIDUAL USER STATS located in the sidebar on index.html which is the play page
// getUserStatsById(user_id) -> returns total runs for a specific user
// uses the runsPerUser view that already exists
export async function getUserStatsById(user_id) {
    const [rows] = await pool.query(`
        SELECT totalRuns
        FROM runsPerUser
        WHERE session_user_id = ?;
        `, [user_id]);

        console.log("Total runs for user_id", user_id, ":", rows[0]);
        return rows[0] ?? {totalRuns: 0}; // if no runs exist, return 0
}

// getTotalWinsByUser(user_id) -> counts runs where victory = TRUE for one user
// counts runs, filters by user AND victory = TRUE
export async function getTotalWinsByUser(user_id) {
    const [rows] = await pool.query(`
        SELECT COUNT(R.run_id) AS totalWins
        FROM runs AS R
        INNER JOIN sessions AS S ON R.run_session_id = S.session_id
        WHERE S.session_user_id = ? AND R.victory = TRUE;
        `, [user_id]);

    console.log("Total wins for user_id", user_id, ":", rows[0]);
    return rows [0] ?? { totalWins: 0};
}

// getTotalDeathsByUser(user_id) -> count runs where victory = FALSE for one user
// counts runs, filters by user AND victory = FALSE
export async function getTotalDeathsByUser(user_id) {
    const [rows] = await pool.query(`
        SELECT COUNT(R.run_id) AS totalDeaths
        FROM runs AS R
        INNER JOIN sessions AS S on R.run_session_id = S.session_id
        WHERE S.session_user_id = ? AND R.victory = FALSE;
        `, [user_id]);

    console.log("Total deaths for user_id", user_id, ":", rows[0]);
    return rows[0] ?? { totalDeaths: 0 };
}

// getBestTimeByUser(user_id) -> finds the shortest run_time from VICTORY state runs
// uses mysql MIN() to find the fastest time from victories
export async function getBestTimeByUser(user_id) {
    const [rows] = await pool.query(`
        SELECT MIN(R.run_time) AS bestTime
        FROM runs AS R
        INNER JOIN sessions AS S 
        ON R.run_session_id = S.session_id
        WHERE S.session_user_id = ? 
        AND R.victory = TRUE
        AND R.run_time IS NOT NULL
        AND R.run_time > 0;
        `, [user_id]);

    console.log("Best time for user_id", user_id, ":", rows[0]);
    return rows [0] ?? { bestTime: null }; // null if no victories yet
}

export async function getMosquitoeReward(mob_name){
    const [reward] = await pool.query("SELECT mosquito_reward FROM mobs WHERE mob_name = ?", [mob_name]);

    const mosqReward = reward[0].mosquito_reward;
    console.log("This ",mob_name, " reward is:",mosqReward);
    return mosqReward;
}

export async function startRunMob(run_id, mob_name){
    const [data] = await pool.query("CALL startRunMob (?,?)",[run_id, mob_name]);

    console.log(data);
    return data;
}

export async function saveRunMob(run_id,mob_name, mobKills){
    const [data] = await pool.query("CALL saveRunMob (?,?,?)",[run_id, mob_name, mobKills]);

    console.log(data);
    return data;
}

export async function initStage(run_id) {
    const [data] = await pool.query(`INSERT INTO run_stages(rs_run_id,stage_number)
        VALUES (?,1)`,[run_id]);
    console.log("Insert into run_stage: ",data);
    return data;
}

export async function finalStage(run_id) {
    const [data] = await pool.query(`UPDATE run_stages 
        SET stage_number = 2 
        WHERE rs_run_id = ?`, [run_id]);
    console.log("Update into run_stage: ",data);
    return data;
}

export async function loadFrog(){
    const [values] = await pool.query("SELECT base_hp, base_damage, base_speed FROM playable_character LIMIT 1");
    console.log("Frog stats: ", values);
    return values;
}

export async function loadBoss(boss_name){
    const [values] = await pool.query(`SELECT base_hp, base_damage, mosquito_reward 
        FROM boss 
        WHERE boss_name = ?`,[boss_name]);
    console.log("Boss values: ", values);
    return values;
}

export async function saveRunBoss(run_id, boss_name,timeToKill, defeated){
    const [data] = await pool.query("CALL saveRunBoss(?,?,?,?)",
        [run_id, boss_name, timeToKill, defeated]);
    console.log("Verify mob_boss: ", data);
    return data;
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


