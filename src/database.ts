import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "";
const client = new MongoClient(uri);
let db: Db;


export const connectToDatabase = async () => {
    if (!uri) {
        throw new Error("Geen MONGO_URI gevonden in .env bestand");
    }

    try {
        await client.connect();
        db = client.db("expensesApp");
        console.log("Verbonden met MongoDB");
    } catch (err) {
        console.error("Fout bij verbinden met MongoDB:", err);
        process.exit(1);
    }
};


export const getDb = (): Db => {
    if (!db) {
        throw new Error("Database is niet verbonden. Roep connectToDatabase aan!");
    }
    return db;
};