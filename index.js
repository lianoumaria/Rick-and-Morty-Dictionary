import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://rickandmortyapi.com/api/";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//Home page
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//Initial character section page - returns a form with character filters to be used as well as a random character
app.get("/character", async (req, res) => {
    const randomId = Math.floor( Math.random()*826 + 1 );
    console.log(randomId);
    try {
        const result = await axios.get(API_URL+`/character/${randomId}`);
        console.log(result.data.name);
        const characterArray = [];
        characterArray.push(new CharacterPrint(result.data.name, result.data.origin.name, result.data.location.name, result.data.species, result.data.image))
        res.render("character.ejs", {
            characters: characterArray
        });
    } catch (error) {
        console.log(error.message);
    }
});

//From my server side i need a post request to pass the filter info
app.post("/character/filter", async (req, res) => {
    let paramsInput = {};
    if (req.body.characterName!=="") {
        paramsInput.name = req.body.characterName;
    };
    if (req.body.characterSpecies!=="") {
        paramsInput.species = req.body.characterSpecies;
    };
    if (req.body.characterGenter!=="") {
        paramsInput.gender = req.body.characterGenter;
    }
    //From the public API i need a GET request to find a character based on my filters
    try {
        const result = await axios.get(API_URL+"/character/", {
            params: paramsInput
        });
        const characterArray = [];
        result.data.results.forEach(character => {
            characterArray.push(new CharacterPrint(character.name, character.origin.name, character.location.name, character.species, character.image));
        });
        res.render("character.ejs", {
            characters: characterArray
        });
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response.status,
            errorMessage: error.response.data.error
        })
    }
});

//Location finder
app.get("/location", async (req, res) => {
    const randomId = Math.floor( Math.random()*126 + 1 );
    console.log(randomId);
    try {
        const result = await axios.get(API_URL+`/location/${randomId}`);
        console.log(result.data.residents);
        const locationArray = [];
        locationArray.push(new LocationPrint(result.data.id, result.data.name, result.data.type, result.data.dimension));
        res.render("location.ejs", {
            locations: locationArray
        });
    } catch (error) {
        console.log(error.message);
    }
});

//From my server side i need a post request to pass the filter info
app.post("/location/filter", async (req, res) => {
    let paramsInput = {};
    if (req.body.locationName!=="") {
        paramsInput.name = req.body.locationName;
    };
    if (req.body.locationType!=="") {
        paramsInput.type = req.body.locationType;
    };
    if (req.body.locationDimension!=="") {
        paramsInput.dimension = req.body.locationDimension;
    }
    //From the public API i need a GET request to find a location based on my filters
    try {
        const result = await axios.get(API_URL+"/location/", {
            params: paramsInput
        });
        const locationArray = [];
        result.data.results.forEach(location => {
            locationArray.push(new LocationPrint(location.id, location.name, location.type, location.dimension));
        });
        res.render("location.ejs", {
            locations: locationArray
        });
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response.status,
            errorMessage: error.response.data.error
        })
    }
});

app.get("/location/:id", async (req, res) => {
    const locationId = req.params.id;
    console.log(locationId);
    let residentsArray = [];
    let charArray = [];

    try {
        const result1 = await axios.get(API_URL+`/location/${locationId}`);
        residentsArray = result1.data.residents;
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.error || error.message
        });
        return;
    }

    for (const residentUrl of residentsArray) {
        try {
            const result = await axios.get(residentUrl);
            const character = result.data;
            charArray.push(new CharacterPrint(character.name, character.origin.name, character.location.name, character.species, character.image));
        } catch (error) {
            console.log(error.message);
        }
    }

    res.render("character.ejs", {
        characters: charArray
    });
});

//Make the server go live
app.listen(port, (req, res) => {
    console.log(`Server running on port ${port}`);
});

//Character object with info that need to be printed
function CharacterPrint(name, origin, finalLocation, species, image) {
    this.name = name;
    this.origin = origin;
    this.location = finalLocation;
    this.species = species;
    this.image = image;
};

function LocationPrint(id, name, type, dimension) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.dimension = dimension;
};