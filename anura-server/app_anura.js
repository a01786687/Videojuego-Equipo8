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
import { createUser, getMobData, getUsers, getUsersById, startSesion } from './db.js'

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
})

app.get("/user", async (req, res) => {
    const user = await getUsersById(100);
    res.send(user);
})

app.get("/sesionStart", async (req, res) => {
    const user = await startSesion(4);
    res.send(user);
})

app.get("/createUser", async (req, res) => {
    const new_user = await createUser("Chalva","chalva67@prodigy.net",67676767);
    res.send(new_user);
})
//Primer get a usar en el juego
app.get("/getMobData/:mob_name",async (req, res) =>{
    const mob_name = req.params.mob_name;

    const data = await getMobData(mob_name);
    res.send(data);
})

// POST /run/death endpoint -> game sends "player died" data to the backend 
// When someone sends POST /run/death, run this function:
app.post("/run/death", async (req, res) => {
    console.log("Death endpoint hit!");
    console.log("Body received:", req.body);

    res.json({
        message: "Death data recieved",
        success: true
    });
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
