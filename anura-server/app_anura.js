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
import { createUser, getMobData, getUsers, getUsersById, startSession, saveRun, countRunsPerSession, getRandomCards, getTotalMosquitoesBySession, updateDeck, getAllCards } from './db.js'

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

app.get("/sessionStart", async (req, res) => {
    const user = await startSession(4);
    res.send(user);
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

// POST /run/death endpoint -> game sends "player died" data to the backend 
// When someone sends POST /run/death, run this function:
app.post("/run/death", async (req, res) => {
    
    const { mosquitoes, session_id, deck } = req.body;

    if (!session_id) {
        return res.status(400).json({ error: " a valid session_id is required" });
    }

    try {
        // save the run
        const bosses_defeated = 0;
        const victory = false;
        const start_time = new Date();
        const runId = await saveRun(session_id, mosquitoes, bosses_defeated, victory, start_time);

        // get the updated lifetime mosquito total
        const mosquitoData = await getTotalMosquitoesBySession(session_id);

        // save the deck
        const cardIds = deck ? deck.flat() : [];
        const deckResult = await updateDeck(session_id, cardIds);

        res.json({
            success: true,
            savedData: {
                runId,
                mosquitoes_this_run: mosquitoes,
                mosquitoes_total: mosquitoData?.mosquitoes_total ?? null,
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


app.get("/stats", async (req, res) =>{


    const data = await countRunsPerSession();
    res.send(data);
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
