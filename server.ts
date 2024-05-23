import express from "express";
import ejs from "ejs";
import { Character, Weapon } from './interfaces';
import characters from './json/characters.json';
import {client, connectMongo} from './mongo/mongo'
import { Console } from "console";

const app = express();
const path = require('path');

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("port", 3000);
app.use(express.json());

// POST route om nieuwe characters toe te voegen
app.post("/characters", async (req, res) => {
    const newCharacter = req.body;

    try{
        const collection = client.db("Elementex").collection("characters"); // neemt json objecten en veranderd deze in JS objecten in DB
        const result = await collection.insertOne(newCharacter); // JS object toevboegen aan "Elementex"
        console.log(`Character added with ID ${result.insertedId}`);
    }
    catch (e){
        console.error(e);
    }
    finally{
        await client.close();
    }
});

//filteren INDEX  pagina
app.get("/", (req, res) => {
    // filteren van characters in zoekbalk
    const q: string = typeof req.query.q === 'string' ? req.query.q : "";
    let filteredCharacters: Character[] = characters.filter(character => 
        character.Names.toLowerCase().includes(q.toLowerCase())
    );

    //sorteren
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    let sortedCharacters = filteredCharacters.sort((a, b) => {
        if (sortField === "Names") {
            return sortDirection === "asc" ? a.Names.localeCompare(b.Names) : b.Names.localeCompare(a.Names);
        } else if (sortField === "Age") {
            return sortDirection === "asc" ? a.Age - b.Age : b.Age - a.Age;
        }
        return 0;
    });

    res.render("index", {
        persons: filteredCharacters, sortedCharacters, sortField, sortDirection,
        q: q
    });
});


//--------------------------------------------------------character pagina 
app.get("/characters", (req, res) => {
    // filteren van characters in zoekbalk
    const q: string = typeof req.query.q === 'string' ? req.query.q : "";
    let filteredCharacters: Character[] = characters.filter(character => 
        character.Names.toLowerCase().includes(q.toLowerCase())
    );

    //sorteren
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    let sortedCharacters = filteredCharacters.sort((a, b) => {
        if (sortField === "Names") {
            return sortDirection === "asc" ? a.Names.localeCompare(b.Names) : b.Names.localeCompare(a.Names);
        } else if (sortField === "Age") {
            return sortDirection === "asc" ? a.Age - b.Age : b.Age - a.Age;
        }
        return 0;
    });

    res.render("characters", {
        characters: sortedCharacters,
        sortField,
        sortDirection,
        q
    });
});

//character vinden via ID
app.get("/characters/:id", (req, res) => {
    const character = characters.find(c => c.ID === req.params.id);
    if (character) {
        res.render("character-detail", { character: character });
    } else {
        res.send("Character not found");
    }
});

// ----------------------------------------------------------------weapons pagina
// elke weapons van elk character uit Array halen
const weapons: Weapon[] = characters.map(character => character.Weapons);

app.get('/weapons', (req, res) => {
    const q: string = typeof req.query.q === 'string' ? req.query.q : "";
    res.render('weapons', { 
        weapons: weapons,
        q: q
    });
});


app.get("/weapons-detail/:weapon_id", (req, res) => {
    const weaponId = req.params.weapon_id;
    const weapon = weapons.find(w => w.weapon_id === weaponId);

    if (weapon) {
        res.render("weapons-detail", { weapon: weapon });
    } else {
        res.status(404).send("Weapon not found");
    }
});

app.use((req, res, next) => {
    res.status(404).send("404 - this page doesn't exist");
});

// CSS STYLE
app.use(express.static(path.join(__dirname, 'public')));


app.listen(app.get("port"), () => console.log(`[server] http://localhost:${app.get("port")}`));
