import express from "express";
import ejs from "ejs";
import path, { format } from "path";
import { Character, Weapon } from './interfaces';
import characters from './json/characters.json';
import { client, connectMongo } from './mongo/mongo';
import { connect, getUsers, createUser, deleteUser, getUserById, updateUser } from "./database";
import { User } from "./types";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("port", PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

//---------------------------------------------------------------------------------------------------- DATABASE CONNECTION
app.listen(PORT, async () => {
    await connect();
    console.log(`Server is running on port ${PORT}`);
});

//---------------------------------------------------------------------------------------------------- CHARACTERS ROUTES
app.post("/characters", async (req, res) => {
    const newCharacter = req.body;

    try {
        const collection = client.db("Elementex").collection("characters");
        const result = await collection.insertOne(newCharacter);
        console.log(`Character added with ID ${result.insertedId}`);
        res.status(201).send(`Character added with ID ${result.insertedId}`);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error adding character");
    }
});

app.get("/", (req, res) => {
    const q: string = typeof req.query.q === 'string' ? req.query.q : "";
    let filteredCharacters: Character[] = characters.filter(character =>
        character.Names.toLowerCase().includes(q.toLowerCase())
    );

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
        persons: sortedCharacters,
        sortField,
        sortDirection,
        q
    });
});

app.get("/characters", (req, res) => {
    const q: string = typeof req.query.q === 'string' ? req.query.q : "";
    let filteredCharacters: Character[] = characters.filter(character =>
        character.Names.toLowerCase().includes(q.toLowerCase())
    );

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

app.get("/characters/:id", (req, res) => {
    const character = characters.find(c => c.ID === req.params.id);
    if (character) {
        res.render("character-detail", { character: character });
    } else {
        res.status(404).send("Character not found");
    }
});

//---------------------------------------------------------------------------------------------------- WEAPONS ROUTES
const weapons: Weapon[] = characters.flatMap(character => character.Weapons);

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

//---------------------------------------------------------------------------------------------------- USERS ROUTES
app.post("/characters/:id/delete", async (req, res) => {
    const characterId = req.params.id;
    try {
        const index = characters.findIndex(c => c.ID === characterId);
        if (index !== -1) {
            characters.splice(index, 1);
            res.redirect("/characters");
        } else {
            res.status(404).send("Character not found");
        }
    } catch (error) {
        console.error("Error deleting character:", error);
        res.status(500).send("Error deleting character");
    }
});

app.get("/characters/:id/update", (req, res) => {
    const characterId = req.params.id;
    const character = characters.find(c => c.ID === characterId);
    if (character) {
        res.render("update", { character: character });
    } else {
        res.status(404).send("Character not found");
    }
});

app.post("/characters/:id/update", async (req, res) => {
    const characterId = req.params.id;
    const updatedCharacterData = req.body;

    try {
        const collection = client.db("Elementex").collection("characters");
        const character = await collection.findOne({ ID: characterId });

        if (!character) {
            return res.status(404).send("Character not found");
        }

        // Update the character fields with the data from the form
        character.Names = updatedCharacterData.Names;
        character.isAlive = updatedCharacterData.Alive === 'on';
        character.Description = updatedCharacterData.Description;
        character.abilities = updatedCharacterData.abilities.split(',').map((ability: string) => ability.trim());

        // Save the updated character back to the database
        await collection.updateOne({ ID: characterId }, { $set: character });

        res.redirect(`/characters/${characterId}`); // Redirect to the character details page after updating
    } catch (error) {
        console.error("Error updating character:", error);
        res.status(500).send("Error updating character");
    }
});


//---------------------------------------------------------------------------------------------------- 404 HANDLER
app.use((req, res, next) => {
    res.status(404).send("404 - this page doesn't exist");
});
