import { Router } from 'express';
import { getExpenses, addExpense } from '../controllers/expenseController';

const router = Router();

// Route om uitgaven te bekijken
router.get('/', (req, res) => {
  const expenses = getExpenses(); // Haalt uitgaven op uit je JSON
  res.render('index', { expenses });
});

// Route om een nieuwe uitgave toe te voegen
router.post('/add', (req, res) => {
  const { description, amount, currency, paymentMethod, isIncome, category, tags, isPaid } = req.body;
  const errorMessage = addExpense({ description, amount, currency, paymentMethod, isIncome, category, tags, isPaid });

  if (errorMessage) {
    // Als er een foutmelding is, stuur dan de gebruiker terug naar het formulier met de foutmelding
    return res.render('index', { errorMessage, oldInput: req.body });
  }

  res.redirect('/expenses');
});

export { router };