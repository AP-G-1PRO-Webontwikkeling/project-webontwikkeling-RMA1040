"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.login = exports.userCollection = exports.updateCharacter = exports.deleteCharacter = exports.getCharacters = exports.connect = exports.uri = exports.characterCollection = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 10;
dotenv_1.default.config();
exports.uri = process.env.MONGODB_URI || "mongodb+srv://raymondmcoding:Jonny1040@cluster0.im6apum.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new mongodb_1.MongoClient(exports.uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
exports.client = client;
//--------------------------------------------------------------------------------------------------------JSON INLEZEN
function initializeData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filePath = path_1.default.join(__dirname, 'json', 'characters.json');
            const data = fs_1.default.readFileSync(filePath, 'utf-8');
            const characters = JSON.parse(data);
            const count = yield exports.characterCollection.countDocuments();
            if (count === 0) {
                console.log("Inserting data from characters.json into the characters collection...");
                yield exports.characterCollection.insertMany(characters);
                console.log("Data inserted successfully.");
            }
            else {
                console.log(`Number of documents in 'characters' collection: ${count}`);
            }
        }
        catch (e) {
            console.error("Error initializing data:", e);
        }
    });
}
//------------------------------------------------------------------------VERBINDING STARTEN MET DATABASE
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("Connected to MongoDB");
            exports.characterCollection = client.db("Elementex").collection("characters");
            yield initializeData();
            yield createInitialUser();
        }
        catch (e) {
            console.error("Error connecting to MongoDB:", e);
        }
    });
}
exports.connect = connect;
//----------------------------------------------------------------------------------CHARACTERS TONEN - VERWIJDEREN - UPDATEN
function getCharacters() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.characterCollection) {
            throw new Error("Character collection is not initialized");
        }
        const characters = yield exports.characterCollection.find({}).toArray();
        console.log("Fetched characters:", characters);
        return characters;
    });
}
exports.getCharacters = getCharacters;
function deleteCharacter(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.characterCollection.deleteOne({ ID: id });
    });
}
exports.deleteCharacter = deleteCharacter;
function updateCharacter(id, character) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.characterCollection.updateOne({ ID: id }, { $set: character });
    });
}
exports.updateCharacter = updateCharacter;
//-----------------------------------------------------------------------------------USER MAKEN
exports.userCollection = client.db("login-express").collection("users");
function createInitialUser() {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield exports.userCollection.countDocuments()) > 0) {
            return;
        }
        let email = process.env.ADMIN_EMAIL;
        let password = process.env.ADMIN_PASSWORD;
        if (email === undefined || password === undefined) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
        }
        yield exports.userCollection.insertOne({
            email: email,
            password: yield bcrypt_1.default.hash(password, saltRounds),
            role: "ADMIN"
        });
    });
}
//---------------------------------------------------------------------------------------LOGIN FUNCTIE
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (email === "" || password === "") {
            throw new Error("Email and password required");
        }
        let user = yield exports.userCollection.findOne({ email: email });
        if (user) {
            if (yield bcrypt_1.default.compare(password, user.password)) {
                return user;
            }
            else {
                throw new Error("Password incorrect");
            }
        }
        else {
            throw new Error("User not found");
        }
    });
}
exports.login = login;
