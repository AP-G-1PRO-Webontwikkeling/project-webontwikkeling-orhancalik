import * as fs from 'fs';
import * as path from 'path';

// Functie om de data te laden vanuit data.json
export function loadData(): any {
    const dataPath = path.join(__dirname, '../data.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
}

// Functie om de data op te slaan naar data.json
export function saveData(data: any): void {
    const dataPath = path.join(__dirname, '../data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export function addExpense(expense: any): string | null {
    if (!expense.description || !expense.amount || !expense.currency || !expense.paymentMethod || !expense.category) {
        return "All fields are required.";
    }

    const data = loadData();
    const user = data.find((u: any) => u.id === 1); // Voorbeeld gebruiker
    if (!user) return null;

    user.expenses.push(expense);
    saveData(data);
    return null; // Geen foutmelding
}

// Functie om de expenses van de gebruiker te tonen
export function getExpenses(): any {
    const data = loadData();
    const user = data.find((u: any) => u.id === 1); // Voorbeeld gebruiker
    return user ? user.expenses : [];
}