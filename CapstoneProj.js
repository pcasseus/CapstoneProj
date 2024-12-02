const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "patrickcasseus",
    password: "patrick0810",
    database: "marvel"
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the database.");
});

// Grab all movies
app.get("/movies", (req, res) => {
    const sql = "SELECT * FROM MarvelMovies ORDER BY IMDb DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching movies:", err);
            res.status(500).send("Error fetching movies.");
            return;
        }
        res.json(results);
    });
});

// Add new movies
app.post("/movies", (req, res) => {
    const {
        Title,
        Director1,
        Director2,
        ReleaseDate,
        IMDb,
        Metascore,
        CriticsScore,
        AudienceScore,
        Letterboxd,
        CinemaScore,
        Budget,
        DomesticGross,
        WorldwideGross,
    } = req.body;

    const sql = `
        INSERT INTO MarvelMovies (
            Title, Director1, Director2, ReleaseDate, IMDb, Metascore, 
            CriticsScore, AudienceScore, Letterboxd, CinemaScore, Budget, 
            DomesticGross, WorldwideGross
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [
        Title, Director1, Director2, ReleaseDate, IMDb, Metascore,
        CriticsScore, AudienceScore, Letterboxd, CinemaScore, Budget,
        DomesticGross, WorldwideGross,
    ], (err, result) => {
        if (err) {
            console.error("Error inserting movie:", err);
            res.status(500).send("Error inserting movie.");
            return;
        }
        res.status(201).send("Movie added successfully.");
    });
});

// Update the movie IMDb rating
app.put("/movies/:id", (req, res) => {
    const { id } = req.params;
    const { IMDb } = req.body;

    const sql = "UPDATE MarvelMovies SET IMDb = ? WHERE ID = ?";
    db.query(sql, [IMDb, id], (err, result) => {
        if (err) {
            console.error("Error updating movie:", err);
            res.status(500).send("Error updating movie.");
            return;
        }
        res.send(`Movie with ID ${id} updated successfully.`);
    });
});

// Delete a movie
app.delete("/movies/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM MarvelMovies WHERE ID = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting movie:", err);
            res.status(500).send("Error deleting movie.");
            return;
        }
        res.send(`Movie with ID ${id} deleted successfully.`);
    });
});

// Group movies by their directors
app.get("/movies/grouped-by-director", (req, res) => {
    const sql = `
        SELECT Director1 AS Director, COUNT(*) AS MovieCount 
        FROM MarvelMovies 
        GROUP BY Director1 
        UNION 
        SELECT Director2 AS Director, COUNT(*) AS MovieCount 
        FROM MarvelMovies 
        GROUP BY Director2 
        ORDER BY MovieCount DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error grouping movies by director:", err);
            res.status(500).send("Error grouping movies by director.");
            return;
        }
        res.json(results);
    });
});

// Grab the top-grossing movies of the set
app.get("/movies/top-grossing", (req, res) => {
    const sql = "SELECT Title, WorldwideGross FROM MarvelMovies ORDER BY WorldwideGross DESC LIMIT 10";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching top-grossing movies:", err);
            res.status(500).send("Error fetching top-grossing movies.");
            return;
        }
        res.json(results);
    });
});

// Fetch movies by release year
app.get("/movies/by-year/:year", (req, res) => {
    const { year } = req.params;
    const sql = `
        SELECT * 
        FROM MarvelMovies 
        WHERE YEAR(ReleaseDate) = ?
        ORDER BY IMDb DESC
    `;
    db.query(sql, [year], (err, results) => {
        if (err) {
            console.error("Error fetching movies by year:", err);
            res.status(500).send("Error fetching movies by year.");
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
