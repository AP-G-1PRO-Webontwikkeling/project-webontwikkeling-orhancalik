import express from 'express';
import { getExpenses, addExpense } from './controllers/expenseController';
import path from 'path';

const app = express();
const PORT = 3000;

// Middleware om JSON te verwerken
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Instellen van de view engine als EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route om de pagina met alle uitgaven te bekijken
app.get('/expenses', (req, res) => {
    const expenses = getExpenses();
    res.render('expenses', { expenses });
});

// Route om een nieuwe uitgave toe te voegen
app.post('/expenses', (req, res) => {
    const { description, amount, currency, paymentMethod, category } = req.body;

    // Controleer of de verplichte velden zijn ingevuld
    if (!description || !amount || !currency || !paymentMethod || !category) {
        // Laad de uitgaven om deze door te geven aan de view bij een fout
        const expenses = getExpenses();
        return res.render('expenses', {
            expenses,
            errorMessage: 'Please fill out all required fields.',
            oldInput: req.body
        });
    }

    const newExpense = {
        id: Date.now(), // Voorbeeld ID, pas aan naar wens
        description,
        amount: parseFloat(amount), // Zorg ervoor dat het bedrag een getal is
        currency,
        paymentMethod,
        isIncoming: req.body.isIncome === 'on', // Omzetten naar boolean
        category,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
        isPaid: req.body.isPaid === 'on', // Omzetten naar boolean
    };

    // Voeg de nieuwe expense toe
    addExpense(newExpense);

    // Redirect naar de expenses pagina
    res.redirect('/expenses');
});

// Route voor de hoofdpagina met het formulier
app.get('/', (req, res) => {
    res.render('index');
});

// Start de server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
