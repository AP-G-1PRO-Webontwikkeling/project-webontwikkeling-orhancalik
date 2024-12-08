import express, { Request, Response } from 'express';
import { getExpenses, addExpense } from './controllers/expenseController';
import { connectToDatabase } from './database'; // Importeren van connectToDatabase uit database.ts
import { Expense, User } from './models/models';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser'



const app = express();
const PORT = 3001;
dotenv.config();


const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

// Middleware om JSON te verwerken
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Instellen van de view engine als EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
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

        // Render de resultaten in de view en geef de queryparameters door
        res.render('expenses', { expenses, isIncoming, search, category });
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

        const expenseId = req.params.id;

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


// Render the edit page with the expense details
app.get('/edit-expense/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const expensesCollection = db.collection('expenses');

        // Haal de id op uit de URL en converteer deze naar ObjectId
        const expenseId = new ObjectId(req.params.id);  // Hier converteren we de id

        const expense = await expensesCollection.findOne({ _id: expenseId });

        if (!expense) {
            return res.status(404).send('Expense not found');
        }

        // Render de edit pagina met de gevonden expense data
        res.render('edit-expense', { expense });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Handle updating the expense
app.post('/edit-expense/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const expensesCollection = db.collection('expenses');

        const expenseId = new ObjectId(req.params.id);
        const { description, amount, currency, paymentMethod, isIncome, category, tags, isPaid } = req.body;

        // Zorg ervoor dat alle velden correct worden geparsed en verwerkt
        const updatedExpense = {
            description,
            amount: parseFloat(amount), // Zorg ervoor dat amount een nummer is
            currency,
            paymentMethod,
            isIncoming: isIncome ? true : false, // Zorg dat isIncome een boolean is
            category,
            tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [], // Zorg ervoor dat tags goed verwerkt worden
            isPaid: isPaid ? true : false, // Zorg dat isPaid een boolean is
        };

        // Werk de uitgave bij in de database
        const result = await expensesCollection.updateOne(
            { _id: expenseId },
            { $set: updatedExpense }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('Expense not found or no changes made');
        }

        // Redirect naar de lijst van uitgaven
        res.redirect('/expenses');
    } catch (error) {
        console.error('Error updating expense:', error);
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
            isIncoming: req.body.isIncome === 'on',  // Zorg ervoor dat isIncome wordt omgezet naar isIncoming
            category,
            tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
            isPaid: req.body.isPaid === 'on',
            date: new Date(),  // Voeg de huidige datum toe
            userId: 1,  // Voeg een voorbeeld userId toe
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
