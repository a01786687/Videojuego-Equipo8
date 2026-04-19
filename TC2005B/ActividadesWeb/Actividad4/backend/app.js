import express from 'express'

import cors from 'cors'

import { getCats, getMenuItems, getMenuByDay } from './database.js'

// app = server instance
const app = express()

// cors: allows requests from different ports
app.use(cors())

// get route to get the list of cats, async callback function
app.get("/api/cats", async (req, res) => {
    const cats = await getCats()
    res.send(cats)
})

// get route to get the list of menu items, async callback function
app.get("/api/menuItems", async (req, res) => {
    const menuItems = await getMenuItems()
    res.send(menuItems)
})


// :day is a dynamic URL parameter ) any day value works 
app.get("/api/menuItems/:day", async (req, res) => {
    const day = req.params.day // grab the day value from the URL
    const menuItems = await getMenuByDay(day) // query the DB filtering by that day
    res.send(menuItems) // sends filtered results to the frontend
})



// error handler: catches any error that occurs in any route
// instead of the server crashing, it returns a proper response
// must always be declared BEFORE app.listen
// err = the error, req = request from frontend, res = response to send back, next = passes to next middleware
// HTTP 500 = internal server error

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})


// port: is the communication door between frontend and backend
// frontend sends requests to port 3000, backend listens and responds

app.listen(8080, () => {
    console.log('Server running on port 8080')
})




// NOTES
// middleware: refers to functions that execute during the request-response cycle

// req.params is an object that contains all the dynamic parameters on the URL

// dynamic URL parameter: a variable segment in a URL marked with (:), 
// it captures whatever value is passed in that position
// ex: /api/menuItems/:day -> /api/menuItems/monday captures "monday"