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
    res.render("index.ejs", {
        tab: "Rick and Morty Dictionary"
    });
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
            characters: characterArray,
            tab: "Character Finder"
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
            characters: characterArray,
            tab: "Character Finder"
        });
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.error || error.message,
            tab: "Error"
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
            locations: locationArray,
            tab: "Location Finder"
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
            locations: locationArray,
            tab: "Location Finder"
        });
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.error || error.message,
            tab: "Error"
        })
    }
});

app.get("/location/:id", async (req, res) => {
    const locationId = req.params.id;
    console.log(locationId);
    let residentsArray = [];

    try {
        const result1 = await axios.get(API_URL+`/location/${locationId}`);
        residentsArray = result1.data.residents;
        console.log(residentsArray);
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.error || error.message,
            tab: "Error"
        });
        return;
    }
    //For every rasident of the location keep its id
    if (residentsArray.length!==0) {
        for (var locRes=0; locRes<residentsArray.length; locRes++){
            residentsArray[locRes] = residentsArray[locRes].replace("https://rickandmortyapi.com/api/character/", "");
        }
        //Concatenate multiple residents to the main URL
        let multipleResUrl = "https://rickandmortyapi.com/api/character/"
        for (const char of residentsArray) {
            multipleResUrl = multipleResUrl + char + ","; 
        }
        multipleResUrl = multipleResUrl.slice(0, -1);

        //Make a single remote api request for all the location's residents
        try {
            const result = await axios.get(multipleResUrl);
            const resArray = [];
            result.data.forEach(character => {
                resArray.push(new CharacterPrint(character.name, character.origin.name, character.location.name, character.species, character.image));
            });
            res.render("character.ejs", {
                characters: resArray,
                tab: "Character Finder"
            });
        } catch (error) {
            res.render("error.ejs", {
                errorCode: error.response?.status || 500,
                errorMessage: error.response?.data?.error || error.message,
                tab: "Error"
            })
        }
    } else {
        res.redirect("/location");
    }
});

//Episode finder
app.get("/episode", async (req, res) => {
    const randomId = Math.floor( Math.random()*51 + 1 );
    console.log(randomId);
    try {
        const result = await axios.get(API_URL+`/episode/${randomId}`);
        console.log(result.data.residents);
        const episodeArray = [];
        episodeArray.push(new EpisodePrint(result.data.id, result.data.name, result.data.episode, result.data.air_date));
        res.render("episode.ejs", {
            episodes: episodeArray,
            tab: "Episode Finder"
        });
    } catch (error) {
        console.log(error.message);
    }
});

//From my server side i need a post request to pass the filter info
app.post("/episode/filter", async (req, res) => {
    let paramsInput = {};
    if (req.body.episodeName!=="") {
        paramsInput.name = req.body.episodeName;
    };
    if (req.body.episodeCode!=="") {
        paramsInput.episode = req.body.episodeCode;
    };
    //From the public API i need a GET request to find an episode based on my filters
    try {
        const result = await axios.get(API_URL+"/episode/", {
            params: paramsInput
        });
        const episodeArray = [];
        result.data.results.forEach(episode => {
            episodeArray.push(new EpisodePrint(episode.id, episode.name, episode.episode, episode.air_date));
        });
        res.render("episode.ejs", {
            episodes: episodeArray,
            tab: "Episode Finder"
        });
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.error || error.message,
            tab: "Error"
        })
    }
});

app.get("/episode/:id", async (req, res) => {
    const episodeId = req.params.id;
    let epCharArray = [];

    try {
        const result1 = await axios.get(API_URL+`/episode/${episodeId}`);
        epCharArray = result1.data.characters;
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.error || error.message,
            tab: "Error"
        });
        return;
    }
    //For every character in the episode keep its id
    for (var epChar=0; epChar<epCharArray.length; epChar++){
        epCharArray[epChar] = epCharArray[epChar].replace("https://rickandmortyapi.com/api/character/", "");
    }
    //Concatenate multiple characters to the main URL
    let multipleCharUrl = "https://rickandmortyapi.com/api/character/"
    for (const char of epCharArray) {
        multipleCharUrl = multipleCharUrl + char + ","; 
    }
    multipleCharUrl = multipleCharUrl.slice(0, -1);

    //Make a single remote api request for all the episode's characters
    try {
        const result = await axios.get(multipleCharUrl);
        const charArray = [];
        result.data.forEach(character => {
            charArray.push(new CharacterPrint(character.name, character.origin.name, character.location.name, character.species, character.image));
        });
        res.render("character.ejs", {
            characters: charArray,
            tab: "Character Finder"
        });
    } catch (error) {
        res.render("error.ejs", {
            errorCode: error.response?.status || 500,
            errorMessage: error.response?.data?.error || error.message,
            tab: "Error"
        })
    }
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

function EpisodePrint(id, name, code, airDate) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.airDate = airDate;
};