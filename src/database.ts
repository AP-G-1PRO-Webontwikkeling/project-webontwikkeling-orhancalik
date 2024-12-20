import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || ""; // Zorg ervoor dat .env het bevat
const client = new MongoClient(uri);
let db: Db;

// Verbind met MongoDB
export const connectToDatabase = async () => {
    if (!uri) {
        throw new Error("Geen MONGO_URI gevonden in .env bestand");
    }

    try {
        await client.connect();
        db = client.db("expensesApp"); // Vervang met je database naam
        console.log("Verbonden met MongoDB");
    } catch (err) {
        console.error("Fout bij verbinden met MongoDB:", err);
        process.exit(1); // Stop app als database niet werkt
    }
};

// Export database referentie
export const getDb = (): Db => {
    if (!db) {
        throw new Error("Database is niet verbonden. Roep connectToDatabase aan!");
    }
    return db;
};