import { MongoClient, ServerApiVersion, Collection } from "mongodb";
import dotenv from "dotenv";
import { Character } from './interfaces';
import fs from 'fs';
import path from 'path';
import bcrypt from "bcrypt";
import { User } from "./types"

const saltRounds : number = 10;

dotenv.config();

//--------------------------------------------------------------------------------------------------------------DATABASE
export let characterCollection: Collection<Character>;

export const uri = process.env.MONGODB_URI || "mongodb+srv://raymondmcoding:Jonny1040@cluster0.im6apum.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//--------------------------------------------------------------------------------------------------------JSON INLEZEN

async function initializeData() {
    try {
        const filePath = path.join(__dirname, 'json', 'characters.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const characters: Character[] = JSON.parse(data);

        const count = await characterCollection.countDocuments();
        if (count === 0) {
            console.log("Inserting data from characters.json into the characters collection...");

            await characterCollection.insertMany(characters);

            console.log("Data inserted successfully.");
        } else {
            console.log(`Number of documents in 'characters' collection: ${count}`);
        }
    } catch (e) {
        console.error("Error initializing data:", e);
    }
}

//------------------------------------------------------------------------VERBINDING STARTEN MET DATABASE
export async function connect() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        characterCollection = client.db("Elementex").collection("characters");

        await initializeData();
        await createInitialUser();

    } catch (e) {
        console.error("Error connecting to MongoDB:", e);
    }
}

//----------------------------------------------------------------------------------CHARACTERS TONEN - VERWIJDEREN - UPDATEN
export async function getCharacters() {
    if (!characterCollection) {
        throw new Error("Character collection is not initialized");
    }
    const characters = await characterCollection.find({}).toArray();
    console.log("Fetched characters:", characters);
    return characters;
}

export async function deleteCharacter(id: string) {
    return await characterCollection.deleteOne({ ID: id });
}

export async function updateCharacter(id: string, character: Character) {
    return await characterCollection.updateOne({ ID: id }, { $set: character });
}

//-----------------------------------------------------------------------------------USER MAKEN
export const userCollection = client.db("login-express").collection<User>("users");

async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let email : string | undefined = process.env.ADMIN_EMAIL;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });
}

//---------------------------------------------------------------------------------------LOGIN FUNCTIE
export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user : User | null = await userCollection.findOne<User>({email: email});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export { client };
