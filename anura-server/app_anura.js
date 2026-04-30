/*
 app_anura.js

 Main Express server for Anura.

 Responsibilities:

 - Initialize the Express app
 - Set up tools so the server can handle requests (like JSON and external access)
 - Define API endpoints (routes)
 - Connect endpoints with database logic (db.js)
 - Start the server

 This file acts as the bridge between:

- Frontend (client)
- Backend logic (database + endpoints)

 */


import express from 'express'
import cors from 'cors'

// importing database functions (queries)
import { createUser, getMobData, getUsers, getUsersById, startSession, 
         saveRun, countRunsPerSession, getRandomCards, getTotalMosquitoesBySession, 
         updateDeck, getAllCards, getNewSessionById, startRun, getDeck, boughtCard,
         addCardToDeck, getTotalRunsPerUser, getTotalMosquitoesPerUser, getTotalMosquitoesByUser, 
         getMosquitoeReward, getUserStatsById, getTotalWinsByUser, getTotalDeathsByUser, getBestTimeByUser, 
         saveRunMob, startRunMob} from './db.js'

const app = express();
const port = 8080;

// --- MIDDLEWARES (TOOLS) ---

app.use(express.json()); // Allows the server to read and understand JSON data sent from the frontend (body parser alternative)
app.use(cors()); // Allows requests from other apps (like the frontend) since it's empty it uses the default configuration


// --- ROUTES (API ENDPOINTS) ---

/* 

    GET /users

    Description:
    - Fetches all users from the database

    Flow:
    Client → /users → server → db.js → MySQL → response → client

*/

//Pruebas
app.get("/users", async (req, res) => {
    const users = await getUsers();
    res.send(users);
});

app.get("/user/:username", async (req, res) => {
    const username = req.params.username; //Le agregamos parámetro para el front
    const user = await getUsersById(username);
    res.send(user);
});

// POST /sessionStart -> creates a new session for the logged in user
// recieves user_id from the frontend after a successful login
// must be a POST because we're creating something new in the db -> a session
app.post("/sessionStart", async (req, res) => {
    const user_id = req.body.user_id;

    // safety check
    // 400 HTTP status code -> bad request
    if (!user_id) {
        return res.status(400).json({error: "user_id is required"});
    }

    // calls startSession function in db.js, passing the real user_id
    // creates a new run in the sessions table and returns the new session_id
    const newSessionId = await startSession(user_id);
    res.json({ session_id: newSessionId });
});

app.post("/createUser", async (req, res) => {
    const {new_username, new_email, new_password} = req.body;
    
    const new_user = await createUser(new_username,new_email,new_password);
    res.json({
        savedData: new_user
    });
});

//Primer get a usar en el juego
app.get("/getMobData/:mob_name",async (req, res) =>{
    const mob_name = req.params.mob_name;

    const data = await getMobData(mob_name);
    res.send(data);
});

app.post("/run/start", async (req,res) => {
    const {session_id} = req.body;

    if(!session_id){
        return res.status(400).json({ error: " a valid session_id is required" });
    }
    try{
        const runID = await startRun(session_id);
        res.json({
            success: true,
            data: runID
        });
    }
    catch (err) {
        console.error("Error in POST /run/start:", err);
        res.status(500).json({ error: "Failed to start run, session_id might not be valid" });
    }
});

//We built a POST to update currency when a card is bought
app.post("/boughtCard", async (req, res) =>{
    const {cost, session_id} = req.body;
    if (!session_id) {
        return res.status(400).json({ error: " a valid run_id is required" });
    }
    try{
        const updatedCurrency = await boughtCard(cost, session_id);
        res.json({
            success: true,
            updatedData: updatedCurrency
        });
    }
    catch (err) {
        console.error("Error in POST /boughtCard", err);
        res.status(500).json({ error: "Failed to update currecny (HINT: might've send object to params)" });
    }
});

app.get("/updateAfterPurchase/:session_id", async (req, res) => {
    const session_id = req.params.session_id;
    
    try {
        const updated = await getTotalMosquitoesByUser(session_id); // ← NEW NAME
        const mosquitoes = updated?.mosquitoes_total ?? 0;
        res.json({ mosquitoes: mosquitoes });
    } catch (err) {
        console.error("Error in /updateAfterPurchase:", err);
        res.status(500).json({ mosquitoes: 0 });
    }
});

// POST /run/death endpoint -> game sends "player died" data to the backend 
// When someone sends POST /run/death, run this function:
app.post("/run/death", async (req, res) => {
    
    const { mosquitoes, run_id, deck, session_id, victory } = req.body;

    if (!session_id) {
        return res.status(400).json({ error: " a valid run_id is required" });
    }

    try {
        // save the run
        // implemented with AI help
        // added victory parameter handling to support death and victory tracking
        // AI helped identify that bosses_Defeated should be 2 for victory and 0 for death, it uses a ternary operator victory ? 2 : 0
        const bosses_defeated = victory ? 2 : 0; // this modification was done with AI for saving the victory boolean true
        
        const runId = await saveRun(run_id, mosquitoes, bosses_defeated, victory || false); 
        // get the updated lifetime mosquito total
        const mosquitoData = await getTotalMosquitoesByUser(session_id);

        // save the deck
        const cardIds = deck ? deck.flat() : [];
        const deckResult = await updateDeck(session_id, cardIds);

        res.json({
            success: true,
            savedData: {
                runId,
                mosquitoes_this_run: mosquitoes,
                mosquitoes_total: mosquitoData.mosquitoes_total,
                deck_cards_saved: deckResult.cardsInserted
            }
        });

    } catch (err) {
        console.error("Error in POST /run/death:", err);
        res.status(500).json({ error: "Failed to save progress on death" });
    }
        
});

// GET /cards/random -> gets 3 random cards from the database for the card selection screen
app.get("/cards/random", async (req, res) => {
    const cards = await getRandomCards();
    res.json(cards);
});

// GET /cards/all -> returns all cards from the database so the frontend can load them with their IDs
app.get("/cards/all", async (req, res) => {
    const cards = await getAllCards();
    res.json(cards);
});

// GET /deck/:session_id -> returns the player's saved deck for this session, it is called by loadDeck() in playScene.js at the start of every run
// it uses getDeck() in db.js which uses the deckBySession view
app.get("/deck/:session_id", async (req, res) => {
    const session_id = req.params.session_id;
    const cards = await getDeck(session_id);
    res.json(cards);
});

// POST /deck/add -> saves a purchased card to the player's deck in the db, it is called by purchaseCard() in cardSelectionScene.js when the player buys a card
app.post("/deck/add", async (req, res) => {
    const { session_id, card_id } = req.body;

    if (!session_id || !card_id) {
        return res.status(400).json({ error: "session_id and card_id are required" });
    }

    try {
        const result = await addCardToDeck(session_id, card_id);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error("Error in POST /deck/add:", err);
        res.status(500).json({ error: "Failed to add card to deck" });
    }
});

app.get("/stats", async (req, res) =>{
    const data = await countRunsPerSession();
    res.send(data);
});

// GET /stats/runsPerUser -> returns the top 10 users by total runs played
// it's used by the stats page leaderboard
app.get("/stats/runsPerUser", async (req, res) => {
    try {
        const data = await getTotalRunsPerUser();
        res.json(data);
    } catch (err) { 
        console.error("Error in GET /stats/runsPerUser:", err);
        res.status(500).json({ error: "Failed to get runs per user" })
    }
});

app.get("/test", async (req,res) =>{
    const data = await getNewSessionById(17);
    res.send(data);
});

// GET /stats/user/:user_id -> returns stats for a specific user 
// used by the index.html sidebar to show personal stats 
app.get("/stats/user/:user_id", async (req, res) => {
    try {
        const user_id = req.params.user_id;

        // call all 4 functions from db.js
        const totalRuns = await getUserStatsById(user_id);
        const totalWins = await getTotalWinsByUser(user_id);
        const totalDeaths = await getTotalDeathsByUser(user_id);
        const bestTime = await getBestTimeByUser(user_id);

        res.json({
            runsPlayed: totalRuns.totalRuns,
            wins: totalWins.totalWins,
            deaths: totalDeaths.totalDeaths,
            bestTime: bestTime.bestTime
        });

    } catch (err) {
        console.error("Error in GET /stats/user/:user_id:", err);
        res.status(500).json({ error: "Failed to get user stats" });
    }
})

// GET /stats/mosquitoesPerUser -> returns top 10 users by total mosquitoes collected
app.get("/stats/mosquitoesPerUser", async (req, res) => {
    try {
        const data = await getTotalMosquitoesPerUser();
        res.json(data);
    } catch(err) {
        console.error("Error in GET /stats/mosquitoesPerUser:", err);
        res.status(500).json({ error: "Failed to get mosquitoes per user" });
    }
});

app.get("/mob/reward/:mob_name", async (req, res) =>{
    const mob_name = req.params.mob_name;
    const reward = await getMosquitoeReward(mob_name);
    res.send(reward);
});

app.post("/startRunMob", async (req, res) =>{
    const {run_id, mob_name} = req.body;
    
    if(!run_id || !mob_name){
        return res.status(400).json({ error: "Values must be recived" });
    }
    try{
        const data = await startRunMob(run_id, mob_name);
        res.json({success: true, initialize: data});
    }
    catch(err){
        console.error("Error in POST /startRunMob:", err);
        res.status(500).json({ error: "Failed to add data to run_mob" });
    }
});

app.post("/saveRunMob", async (req, res) =>{
    const {run_id, mob_name, mobKills} = req.body;

    if(!run_id || !mob_name || !mobKills){
         return res.status(400).json({ error: "Values can't be null" });
    }
    try{
        const data = await saveRunMob(run_id, mob_name, mobKills);
        res.json({success: true, saved: data});
    }
    catch(err){
        console.error("Error in POST /saveRunMob:", err);
        res.status(500).json({ error: "Failed to update data to run_mob" });
    }

});

// --- SERVER START ---

app.listen(port, () => {
    console.log(`Anura server running on port ${port}`);
});

//Ejemplo:

// app.get('/cartas/:dificultad', (req, res) => {

//     const dificultad = req.params.dificultad;

//     const connection = mysql.createConnection({
//         host: host,
//         user: user,
//         password: pass,
//         database: db
//     });

//     connection.connect((err) => {
//         if (err) throw err;

//         connection.query('SELECT * FROM Carta WHERE dificultad_requerida = ?', [dificultad], (err, results) => {
//                 if (err) throw err;

//                 connection.end();
                
//                 res.json(results);
//             }
//         );
//     });
// });


/* NOTES:

 - All database queries should be defined in db.js
 - This file should only handle routes and server logic
 - Avoid putting SQL queries directly here

cors() -> by default it allows requests from any origin (any frontend, any domain)

*/
