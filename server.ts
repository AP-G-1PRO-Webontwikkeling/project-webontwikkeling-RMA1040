import express from "express";
import ejs from "ejs";
import path from "path";
import { Character } from './interfaces';
import { connect, getCharacters,updateCharacter, deleteCharacter,login } from './mongo';
import dotenv from "dotenv";
import { User } from "./types"
import session from "./session";
import { secureMiddleware } from "./secureMiddleware";
import { loginRouter } from "./routes/loginRouter";
import { homeRouter } from "./routes/homeRouter";
import { flashMiddleware } from "./flashMiddleware";

dotenv.config();

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
app.get("/", async (req, res) => {
    try {
        const q: string = typeof req.query.q === 'string' ? req.query.q : "";
        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "Names";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

        const characters = await getCharacters();
        console.log("Fetched characters for route:", characters);
        let filteredCharacters: Character[] = characters.filter(character =>
            character.Names.toLowerCase().includes(q.toLowerCase())
        );

        let sortedCharacters = filteredCharacters.sort((a, b) => {
            if (sortField === "Names") {
                return sortDirection === "asc" ? a.Names.localeCompare(b.Names) : b.Names.localeCompare(a.Names);
            } else if (sortField === "Age") {
                return sortDirection === "asc" ? a.Age - b.Age : b.Age - a.Age;
            }
            return 0;
        });

        console.log("Filtered and sorted characters:", sortedCharacters);

        res.render("index", {
            persons: sortedCharacters,
            sortField,
            sortDirection,
            q
        });
    } catch (error) {
        console.error("Error fetching characters:", error);
        res.status(500).send("Error fetching characters");
    }
});

app.get("/characters", async (req, res) => {
    try {
        const q: string = typeof req.query.q === 'string' ? req.query.q : "";
        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "Names";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

        const characters = await getCharacters();
        console.log("Fetched characters for route:", characters);
        let filteredCharacters: Character[] = characters.filter(character =>
            character.Names.toLowerCase().includes(q.toLowerCase())
        );

        let sortedCharacters = filteredCharacters.sort((a, b) => {
            if (sortField === "Names") {
                return sortDirection === "asc" ? a.Names.localeCompare(b.Names) : b.Names.localeCompare(a.Names);
            } else if (sortField === "Age") {
                return sortDirection === "asc" ? a.Age - b.Age : b.Age - a.Age;
            }
            return 0;
        });

        console.log("Filtered and sorted characters:", sortedCharacters);

        res.render("characters", {
            characters: sortedCharacters,
            sortField,
            sortDirection,
            q
        });
    } catch (error) {
        console.error("Error fetching characters:", error);
        res.status(500).send("Error fetching characters");
    }
});

app.get("/characters/:id", async (req, res) => {
    try {
        const characters = await getCharacters();
        const character = characters.find(c => c.ID === req.params.id);
        if (character) {
            res.render("character-detail", { character: character });
        } else {
            res.status(404).send("Character not found");
        }
    } catch (error) {
        console.error("Error fetching character:", error);
        res.status(500).send("Error fetching character");
    }
});

//---------------------------------------------------------------------------------------------------- WEAPONS ROUTES
app.get('/weapons', async (req, res) => {
    try {
        const characters = await getCharacters();
        const weapons = characters.flatMap(character => character.Weapons);

        const q: string = typeof req.query.q === 'string' ? req.query.q : "";
        const filteredWeapons = weapons.filter(weapon =>
            weapon.weapon_name.toLowerCase().includes(q.toLowerCase())
        );

        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "weapon_name";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

        const sortedWeapons = filteredWeapons.sort((a, b) => {
            if (sortField === "weapon_name") {
                return sortDirection === "asc" ? a.weapon_name.localeCompare(b.weapon_name) : b.weapon_name.localeCompare(a.weapon_name);
            } else if (sortField === "weapon_power") {
                return sortDirection === "asc" ? a.weapon_power - b.weapon_power : b.weapon_power - a.weapon_power;
            }
            return 0;
        });

        res.render("weapons", {
            weapons: sortedWeapons,
            sortField: sortField,
            sortDirection: sortDirection,
            q: q
        });        
    } catch (error) {
        console.error("Error fetching weapons:", error);
        res.status(500).send("Error fetching weapons");
    }
});

app.get("/weapons-detail/:weapon_id", async (req, res) => {
    try {
        const characters = await getCharacters();
        const weapons = characters.flatMap(character => character.Weapons);
        const weapon = weapons.find(w => w.weapon_id === req.params.weapon_id);

        if (weapon) {
            res.render("weapons-detail", { weapon: weapon });
        } else {
            res.status(404).send("Weapon not found");
        }
    } catch (error) {
        console.error("Error fetching weapon:", error);
        res.status(500).send("Error fetching weapon");
    }
});

//---------------------------------------------------------------------------------------------------- CRUD CHARACTERS ROUTES
app.post("/characters/:id/delete", async (req, res) => {
    const characterId = req.params.id;
    try {
        await deleteCharacter(characterId);
        res.redirect("/characters");
    } catch (error) {
        console.error("Error deleting character:", error);
        res.status(500).send("Error deleting character");
    }
});

app.get("/characters/:id/update", async (req, res) => {
    try {
        const characters = await getCharacters();
        const character = characters.find(c => c.ID === req.params.id);
        if (character) {
            res.render("update", { character: character });
        } else {
            res.status(404).send("Character not found");
        }
    } catch (error) {
        console.error("Error fetching character:", error);
        res.status(500).send("Error fetching character");
    }
});

app.post("/characters/:id/update", async (req, res) => {
    const characterId = req.params.id;
    const updatedCharacter = req.body;
    try {
        await updateCharacter(characterId, updatedCharacter);
        res.redirect("/characters");
    } catch (error) {
        console.error("Error updating character:", error);
        res.status(500).send("Error updating character");
    }
});

//---------------------------------------------------------LOGIN
app.get("/login", (req, res) => {
    res.render("login");
});

app.use(session);

app.post("/login", async(req, res) => {
    const email : string = req.body.email;
    const password : string = req.body.password;
    try {
        let user : User = await login(email, password);
        delete user.password; 
        req.session.user = user;
        req.session.message = {type: "success", message: "Login successful"};
        res.redirect("/");
    } catch (e : any) {
        req.session.message = {type: "error", message: e.message};
        res.redirect("/login");
    }
});

app.get("/home", async(req, res) => {
    res.render("home");
});

app.get("/home", async(req, res) => {
    if (req.session.user) {
        res.render("home", {user: req.session.user});
    } else {
        res.redirect("/login");
    }
});

app.get("/home", secureMiddleware, async(req, res) => {
    res.render("home");
});

app.get("/logout", async(req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.use(loginRouter());
app.use(homeRouter());
app.use(flashMiddleware);