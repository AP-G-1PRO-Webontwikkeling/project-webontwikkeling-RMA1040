import express from "express";
import ejs from "ejs";
import path from "path";
import { Character, Weapon } from './interfaces';
import characters from './json/characters.json';
import { client, connectMongo } from './mongo/mongo';
import { connect, getUsers, createUser, deleteUser, getUserById, updateUser } from "./database";
import { User } from "./types";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("port", PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.get("/users", async (req, res) => {
    try {
        let users: User[] = await getUsers();
        res.render("users/index", {
            users: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching users");
    }
});

app.get("/users/create", (req, res) => {
    res.render("users/create");
});

app.post("/users/create", async (req, res) => {
    let user: User = req.body;
    try {
        await createUser(user);
        res.redirect("/users");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating user");
    }
});

app.post("/users/:id/delete", async (req, res) => {
    let id: number = parseInt(req.params.id);
    try {
        await deleteUser(id);
        res.redirect("/users");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting user");
    }
});

app.get("/users/:id/update", async (req, res) => {
    let id: number = parseInt(req.params.id);
    try {
        let user: User | null = await getUserById(id);
        if (user) {
            res.render("users/update", { user: user });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching user");
    }
});

app.post("/users/:id/update", async (req, res) => {
    let id: number = parseInt(req.params.id);
    let user: User = req.body;
    try {
        await updateUser(id, user);
        res.redirect(`/users/${id}/update`);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Error updating user");
    }
});

//---------------------------------------------------------------------------------------------------- 404 HANDLER
app.use((req, res, next) => {
    res.status(404).send("404 - this page doesn't exist");
});
