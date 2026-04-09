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
import { getUsers } from './db.js'

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


app.get("/users", async (req, res) => {
    const users = await getUsers()
    res.send(users)
})

// --- SERVER START ---

app.listen(port, () => {
    console.log(`Anura server running on port ${port}`);
});


/* NOTES:

 - All database queries should be defined in db.js
 - This file should only handle routes and server logic
 - Avoid putting SQL queries directly here

cors() -> by default it allows requests from any origin (any frontend, any domain)

*/
