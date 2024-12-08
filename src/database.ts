import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

let database: Db | null = null;

// Functie om verbinding te maken en de database te retourneren
export async function connectToDatabase(): Promise<Db> {
    if (database) {
        return database; // Hergebruik de bestaande verbinding als deze al bestaat
    }

    try {
        await client.connect();
        database = client.db('expenses_db'); // Naam van je database
        console.log('MongoDB connected');
        return database;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error; // Laat het doorgaan voor verdere foutafhandeling
    }
}

// Functie om de databaseverbinding te verkrijgen (hergebruiken van connectie)
export function getDatabase(): Db {
    if (!database) {
        throw new Error('Database not connected yet. Please connect first.');
    }
    return database;
}