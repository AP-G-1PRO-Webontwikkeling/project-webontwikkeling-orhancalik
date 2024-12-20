import { Router } from "express";
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

        res.render("index", { expenses, filter, search, isIncoming, user });

    } catch (err) {
        console.error(err);
        req.flash("error", "Fout bij het laden van transacties.");
        res.redirect("/");
    }
});

// Voeg een nieuwe uitgave toe
router.post("/expenses/add", async (req, res) => {
    try {
        const { description, amount, category, isIncoming, date, paymentMethod } = req.body;
        const db = getDb();
        await db.collection("expenses").insertOne({
            description,
            amount: parseFloat(amount),
            category,
            date: new Date(date),
            paymentMethod: { method: paymentMethod },
            isIncoming: isIncoming === "true",
            userId: 1,
            isPaid: true,
            tags: [],
        });
        req.flash("success", "Uitgave succesvol toegevoegd!");
        res.redirect("/");
    } catch (err) {
        console.error(err);
        req.flash("error", "Fout bij het toevoegen van uitgave.");

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
