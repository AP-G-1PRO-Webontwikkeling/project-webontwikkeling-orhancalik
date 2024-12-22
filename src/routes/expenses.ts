import { Router, Request, Response } from "express";
import { getDb } from "../database";
import { ObjectId } from "mongodb";
import { isAuthenticated } from "../middleware/authMiddleware";
const router = Router();

// Haal alle uitgaven op
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const db = getDb();
        const { filter, search } = req.query;

        // Basisquery
        const query: any = {};

        // Filter op inkomend of uitgaand
        if (filter === "income") {
            query.isIncoming = true;  // Alleen inkomens
        } else if (filter === "expense") {
            query.isIncoming = false; // Alleen uitgaven
        }

        // Zoek op omschrijving of categorie als zoekterm is gegeven
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }

        // Haal de gegevens op uit de database
        const expenses = await db.collection("expenses").find(query).toArray();

        // Haal user van de sessie (als ingelogd)
        const user = req.session.user || null;  // Zorg ervoor dat user altijd gedefinieerd is

        // Stuur filter, isIncoming en user naar de view
        const isIncoming = filter === "income" ? "true" : filter === "expense" ? "false" : "";

        res.render("index", { expenses, filter, search, isIncoming, userId: req.session.userId, user });

    } catch (err) {
        console.error(err);
        req.flash("error", "Fout bij het laden van transacties.");
        res.redirect("/");
    }
});

// Voeg een nieuwe uitgave toe
// Voeg een nieuwe uitgave toe
router.post("/expenses/add", async (req: Request, res: Response) => {
    try {
        const { description, amount, category, isIncoming, date, paymentMethod, currency } = req.body;
        const db = getDb();
        const userId = req.session.userId; // Haal de ingelogde gebruiker op uit de sessie

        if (!userId) {
            req.flash("error", "Gebruiker niet ingelogd.");
            return res.redirect("/login");
        }

        // Zorg ervoor dat userId een ObjectId is
        const userObjectId = new ObjectId(userId);

        // Voeg de uitgave toe met het juiste userId
        await db.collection("expenses").insertOne({
            description,
            amount: parseFloat(amount),
            category,
            isIncoming: isIncoming === "true",
            date: new Date(date),
            paymentMethod: { method: paymentMethod },
            currency, // Voeg currency toe
            tags: [], // Stel tags in zoals gewenst
            isPaid: true,
            userId: userObjectId, // Zorg ervoor dat dit een ObjectId is
        });

        // Bereken de totale uitgaven van de gebruiker
        const totalExpenses = await db.collection("expenses").aggregate([
            { $match: { userId: userObjectId, isIncoming: false } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).toArray();

        const totalSpent = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
        const user = await db.collection("users").findOne({ _id: userObjectId });

        const monthlyLimit = user?.budget.monthlyLimit || 0; // Maandbudget

        // Bereken de 90% van het maandbudget
        const ninetyPercentBudget = monthlyLimit * 0.9;

        console.log("Total spent:", totalSpent); // Dit is de totale uitgave
        console.log("Monthly Limit:", monthlyLimit); // Dit is het maandbudget
        console.log("90% of Monthly Limit:", ninetyPercentBudget); // Dit is 90% van het maandbudget

        // Controleer of de drempel wordt overschreden of bijna wordt overschreden
        if (user?.receiveNotifications) {
            if (totalSpent >= monthlyLimit) {
                // Als het totaal gelijk of groter is dan het maandbudget
                console.log("Waarschuwing geactiveerd: Drempel overschreden.");
                req.flash("error", `Je hebt de drempel van je budget overschreden! Je hebt al €${totalSpent.toFixed(2)} uitgegeven.`);
            } else if (totalSpent >= ninetyPercentBudget) {
                // Als het totaal minstens 90% van het maandbudget is, maar nog niet overschreden
                console.log("Waarschuwing geactiveerd: Drempel bijna bereikt.");
                req.flash("error", `Je hebt de drempel van je budget bijna bereikt! Je hebt al €${totalSpent.toFixed(2)} uitgegeven.`);
            } else {
                console.log("Drempel nog niet bereikt.");
            }
        }

        req.flash("success", "Uitgave succesvol toegevoegd!");
        res.redirect("/");

    } catch (err) {
        console.error(err);
        req.flash("error", "Fout bij het toevoegen van uitgave.");
        res.redirect("/");
    }
});




router.get("/expenses/add", (req, res) => {
    res.render("addExpense");
});

router.get("/expenses/edit/:id", async (req, res) => {
    try {
        const db = getDb();
        const expense = await db.collection("expenses").findOne({ _id: new ObjectId(req.params.id) });

        if (!expense) {
            return res.status(404).send("Uitgave niet gevonden");
        }

        res.render("editExpense", { expense });
    } catch (err) {
        console.error(err);
        res.status(500).send("Fout bij het ophalen van uitgave");
    }
});

router.post("/expenses/edit/:id", async (req, res) => {
    try {
        const db = getDb();
        const { description, amount, date, category, isIncoming, paymentMethod, tags, isPaid } = req.body;

        const updatedExpense = {
            description,
            amount: parseFloat(amount),
            date: new Date(date),
            category,
            paymentMethod: { method: paymentMethod },
            tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
            isPaid: isPaid === "on",
            isIncoming: isIncoming === "true",
        };

        await db.collection("expenses").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updatedExpense }
        );
        req.flash("success", "Uitgave succesvol bijgewerkt!");
        res.redirect("/");
    } catch (err) {
        console.error(err);
        req.flash("error", "Fout bij het bijwerken van uitgave.");
        res.redirect("/");
    }
});

router.post("/expenses/delete/:id", async (req, res) => {
    try {
        const db = getDb();
        const expenseId = req.params.id;

        // Verwijder de uitgave uit de database
        await db.collection("expenses").deleteOne({ _id: new ObjectId(expenseId) });

        // Redirect naar de overzichtspagina nadat de uitgave is verwijderd
        req.flash("success", "Uitgave succesvol verwijderd!");
        res.redirect("/");
    } catch (err) {
        console.error(err);
        req.flash("error", "Fout bij het verwijderen van uitgave.");
        res.redirect("/");
    }
});

export default router;