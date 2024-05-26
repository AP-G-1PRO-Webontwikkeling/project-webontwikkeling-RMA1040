import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { User } from "./types";
dotenv.config();

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

export const collection : Collection<User> = client.db("exercises").collection<User>("users");

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function getUsers() {
    return await collection.find({}).toArray();
}

export async function getUserById(id: number) {
    return await collection.findOne({ id: id });
}

export async function updateUser(id: number, user: User) {
    return await collection.updateOne({ id : id }, { $set:  user });
}

export async function getNextId() {
    let users : User[] = await collection.find({}).sort({id: -1}).limit(1).toArray();
    if (users.length == 0) {
        return 1;
    } else {
        return users[0].id + 1;
    }
}

export async function createUser(user: User) {
    user.id = await getNextId();
    return await collection.insertOne(user);
}

export async function deleteUser(id: number) {
    return await collection.deleteOne({id: id});
}

export async function loadUsersFromApi() {
    const users : User[] = await getUsers();
    if (users.length == 0) {
        console.log("Database is empty, loading users from API")
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        const users : User[] = await response.json();
        console.log(users);
        await collection.insertMany(users);
    }
}

export async function connect() {
    try {
        await client.connect();
        await loadUsersFromApi();   
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}