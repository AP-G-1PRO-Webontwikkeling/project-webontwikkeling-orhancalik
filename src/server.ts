import express, { Request, Response } from 'express';
import { getExpenses, addExpense } from './controllers/expenseController';
import { connectToDatabase } from './database'; // Importeren van connectToDatabase uit database.ts
import { Expense } from './models/models';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';



const app = express();
const PORT = 3001;
dotenv.config();


const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

// Middleware om JSON te verwerken
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Instellen van de view engine als EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//MongoDB verbinding

connectToDatabase().then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Route om de pagina met alle uitgaven te bekijken
app.get('/expenses', async (req, res) => {
    try {
        const db = await connectToDatabase(); // Verbind met de database
        const expensesCollection = db.collection('expenses');

        // Ontvang queryparameters
        const { isIncoming, search, category } = req.query;

        // Bouw het filterobject op basis van queryparameters
        const filter: any = {};
        if (isIncoming) {
            filter.isIncoming = isIncoming === 'true'; // Converteer naar boolean
        }
        if (search) {
            filter.description = { $regex: search, $options: 'i' }; // Case-insensitive zoeken
        }
        if (category) {
            filter.category = category;
        }

        // Zoek in de collectie met het filter
        const expenses = await expensesCollection.find(filter).toArray();

        // Render de resultaten in de view
        res.render('expenses', { expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/expenses/:id', async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const expensesCollection = db.collection('expenses');

        const expenseId = req.params.id;
        const updateData = req.body;

        const result = await expensesCollection.updateOne(
            { _id: new ObjectId(expenseId) },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('Expense not found or no changes made.');
        }

        res.status(200).send('Expense updated successfully.');
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/expenses/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const expensesCollection = db.collection('expenses');

        const expenseId = req.params.id; // ID van de uitgave

        // Verwijder de uitgave
        const result = await expensesCollection.deleteOne({ _id: new ObjectId(expenseId) });

        if (result.deletedCount === 0) {
            return res.status(404).send('Expense not found.');
        }

        res.status(200).send('Expense deleted successfully.');
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route om een nieuwe uitgave toe te voegen
app.post('/expenses', async (req, res) => {
    try {
        const { description, amount, currency, paymentMethod, category } = req.body;

        if (!description || !amount || !currency || !paymentMethod || !category) {
            const expenses = await getExpenses();
            return res.render('expenses', {
                expenses,
                errorMessage: 'Please fill out all required fields.',
                oldInput: req.body,
            });
        }

        const newExpense: Expense = {
            description,
            amount: parseFloat(amount),
            currency,
            paymentMethod,
            isIncoming: req.body.isIncome === 'on',
            category,
            tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
            isPaid: req.body.isPaid === 'on',
            date: new Date(), // Voeg een datum toe
            userId: 1, // Voeg voorbeeld gebruiker-id toe
        };

        await addExpense(newExpense); // Voeg de nieuwe uitgave toe
        res.redirect('/expenses');
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route voor de hoofdpagina met het formulier
app.get('/', (req, res) => {
    res.render('index');
});

// Start de server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
