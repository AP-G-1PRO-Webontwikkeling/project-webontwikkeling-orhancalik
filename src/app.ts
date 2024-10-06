import * as fs from 'fs';
import * as readlineSync from 'readline-sync';

// Functie om de data te laden vanuit data.json
function loadData(): any {
    const data = fs.readFileSync('./src/data.json', 'utf-8');
    return JSON.parse(data);
}

// Functie om de data op te slaan naar data.json
function saveData(data: any): void {
    fs.writeFileSync('./src/data.json', JSON.stringify(data, null, 2));
}

// Functie om een expense toe te voegen
function addExpense(user: any): void {
    const description = readlineSync.question('Enter description: ');
    const amount = parseFloat(readlineSync.question('Enter amount: '));
    const currency = readlineSync.question('Enter currency (c.g., USD, EUR): ');
    const paymentMethodType = readlineSync.question('Enter payment method (Credit Card/Bank Transfer): ');

    const isIncome = readlineSync.keyInYNStrict('Is this income? (yes/no): ');
    const category = readlineSync.question('Enter category: ');
    const tags = readlineSync.question('Enter tags (comma separated): ').split(',').map(tag => tag.trim());
    const isPaid = readlineSync.keyInYNStrict('Is this expense paid? (yes/no): ');

    let paymentMethod: { method: string; cardDetails?: { number: string; expiryDate: string } | null; bankAccountNumber?: string | null } = {
        method: paymentMethodType,
        cardDetails: null,
        bankAccountNumber: null,
    };

    if (paymentMethodType === 'Credit Card') {
        const cardNumber = readlineSync.question('Enter last 4 digits of credit card: ');
        const expiryDate = readlineSync.question('Enter expiry date (MM/YY): ');
        paymentMethod.cardDetails = {
            number: `**** **** **** ${cardNumber}`,
            expiryDate: expiryDate
        };
    } else if (paymentMethodType === 'Bank Transfer') {
        const bankAccountNumber = readlineSync.question('Enter bank account number (masked): ');
        paymentMethod.bankAccountNumber = `**** **** **** ${bankAccountNumber}`;
    }

    const newExpense = {
        id: user.expenses.length + 1,
        description,
        amount,
        date: new Date().toISOString(),
        currency,
        paymentMethod,
        isIncoming: !isIncome,
        category,
        tags,
        isPaid
    };

    user.expenses.push(newExpense);
    saveData(loadData()); // Update the whole data after adding the expense
    console.log('Expense added successfully!');
}

// Functie om de expenses van de gebruiker te tonen
function browseExpenses(user: any): void {
    console.log(`Expenses for ${user.name}:`);

    user.expenses.forEach((expense: any, index: number) => {
        console.log(`${index + 1}. ${expense.description} - ${expense.amount} ${expense.currency}`);
        console.log(`Date: ${expense.date}`);
        console.log(`Paid: ${expense.isPaid ? 'Yes' : 'No'}`);
        console.log(`Category: ${expense.category}`);
        console.log(`Tags: ${expense.tags.join(', ')}`);
        console.log('');
    });

    if (user.expenses.length === 0) {
        console.log('No expenses found.');
    }
}

// Functie om de gebruiker te vragen welke actie te ondernemen
function main(): void {
    const users = loadData();
    const userId = 1; // Gebruik de eerste gebruiker (John Doe)
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
        console.error('User not found');
        return;
    }

    while (true) {
        const action = readlineSync.question('Choose an action: [add] expense, [browse] expenses, [exit]: ');

        if (action === 'add') {
            addExpense(user);
        } else if (action === 'browse') {
            browseExpenses(user);
        } else if (action === 'exit') {
            break;
        } else {
            console.log('Invalid action. Please choose again.');
        }
    }
}

main();