import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://rickandmortyapi.com/api/";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.get("/character", async (req, res) => {
    const randomId = Math.floor( Math.random()*826 + 1 );
    console.log(randomId);
    try {
        const result = await axios.get(API_URL+`/character/${randomId}`);
        console.log(result.data.name);
        res.render("character.ejs", {
            name: result.data.name,
            origin: result.data.origin.name,
            location: result.data.location.name,
            species: result.data.species,
            image: result.data.image
        });
    } catch (error) {
        console.log(error.message);
    }
})

app.listen(port, (req, res) => {
    console.log(`Server running on port ${port}`);
})