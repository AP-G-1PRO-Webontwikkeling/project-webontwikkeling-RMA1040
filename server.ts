import express from "express";
import ejs from "ejs";
import { Character, Weapon } from './interfaces';
import characters from './json/characters.json';

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("port", 3000);


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


//character pagina 
app.get("/characters", (req, res) => {
    res.render("characters", { characters: characters });
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

// weapons pagina
// Extracting weapons from each character
const weapons: Weapon[] = characters.map(character => character.Weapons);

app.get('/weapons', (req, res) => {
    res.render('weapons', { weapons: weapons });
});

app.get("/weapon-details/:weaponId", (req, res) => {
    const weaponId = req.params.weaponId;
    const weapon = weapons.find(w => w.weapon_id === weaponId);  // Ensure you have an array `weapons` available

    if (weapon) {
        res.render("weapon-detail", { weapon: weapon });
    } else {
        res.status(404).send("Weapon not found");
    }
});

app.use((req, res, next) => {
    res.status(404).send("404 - server not found");
});

app.listen(app.get("port"), () => console.log(`[server] http://localhost:${app.get("port")}`));
