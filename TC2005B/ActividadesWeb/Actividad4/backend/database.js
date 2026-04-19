import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

// instead of hardcoding these values, we use environment variables:

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()


// this function queries the database and returns all cats
// it will be called by the endpoint in server.js
export async function getCats() {
    const [rows] = await pool.query("SELECT * FROM cats") 
    // pool.query() returns an array: [rows, metadata]
    // we destructure it so it only grabs the rows
    // in this case rows are all the cats from the database, ready to send to the frontend
    return rows
}

export async function getMenuItems() {
    const [rows] = await pool.query("SELECT * FROM menu_items")
    return rows
}


export async function getMenuByDay(day) {
    // ? is a placeholder for the day parameter, [day] is the value that replaces it
    const [rows] = await pool.query("SELECT * FROM menu_items WHERE day = ?", [day]) 
    return rows
}

// running "node database.js" tells Node.js to execute this file
// useful for testing: checks that the DB connection works, the query is correct, and the data exists
// environment variables: key-value pairs stored outside of a program's code, used to configure application behavior and secure sensitive data