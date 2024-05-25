import express, {Express, Request, Response,NextFunction} from "express";
import ejs from "ejs";
import { Character, Weapon } from './interfaces';
import characters from './json/characters.json';
import { connect, getUsers,createUser,deleteUser, getUserById, updateUser } from "./database";
import { User } from "./types";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

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

// DATABASE
app.listen(3000, async () => {
    await connect();
    console.log("Server is running on port 3000");
});

app.get("/users", async(req, res) => {
    let users : User[] = await getUsers();
    res.render("users/index", {
        users: users
    });
});

app.get("/users/create", async(req, res) => {
    res.render("users/create");
});

app.post("/users/create", async(req, res) => {
    let user : User = req.body;
    await createUser(user);
    res.redirect("/users");
});

app.post("/users/:id/delete", async(req, res) => {
    let id : number = parseInt(req.params.id);
    await deleteUser(id);
    res.redirect("/users");
});

app.get("/users/:id/update", async(req, res) => {
    let id : number = parseInt(req.params.id);
    let user : User | null = await getUserById(id);
    res.render("users/update", {
        user: user
    });
});

app.post("/users/:id/update", async(req, res) => {
    let id : number = parseInt(req.params.id);
    let user : User = req.body;
    await updateUser(id, user);
    res.redirect("/users");
});

app.listen(app.get("port"), () => console.log(`[server] http://localhost:${app.get("port")}`));
