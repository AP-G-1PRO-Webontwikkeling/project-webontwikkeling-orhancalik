import { Db } from 'mongodb';
import { Expense } from '../models/models';
import { getDatabase } from '../database'; // Dit wordt aangepast naar een functie die de database levert

// Functie om uitgaven op te slaan in MongoDB
export async function addExpense(expense: Expense): Promise<void> {
    const db: Db = getDatabase(); // Gebruik de databaseverbinding die al in server.ts is aangemaakt
    const expensesCollection = db.collection<Expense>('expenses');

    // Voeg de nieuwe expense toe aan de database
    await expensesCollection.insertOne(expense);
}

// Functie om uitgaven op te halen uit MongoDB
export async function getExpenses(): Promise<Expense[]> {
    const db: Db = getDatabase(); // Gebruik de databaseverbinding die al in server.ts is aangemaakt
    const expensesCollection = db.collection<Expense>('expenses');

    // Haal alle uitgaven op
    return await expensesCollection.find({}).toArray();
}