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

app.use((req, res, next) => {
    res.status(404).send("404 - server not found");
});

app.listen(app.get("port"), () => console.log(`[server] http://localhost:${app.get("port")}`));
