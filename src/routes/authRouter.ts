import { Router } from "express";
import { getDb } from "../database";
import bcrypt from "bcrypt";
import { isLoggedIn } from "../middleware/authMiddleware";

const router = Router();



// Registratie
router.get("/register", (req, res) => {
    res.render("register"); // Zorg voor een 'register.ejs' of een andere view
});

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    // Controleer of de gebruiker al bestaat
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
        req.flash("error", "Gebruikersnaam bestaat al.");
        return res.redirect("/register");
    }

    // Hasht het wachtwoord
    const hashedPassword = await bcrypt.hash(password, 10);

    // Voeg de nieuwe gebruiker toe
    await db.collection("users").insertOne({
        username,
        password: hashedPassword,
    });

    req.flash("success", "Registratie succesvol!");
    res.redirect("/login");
});

// Login
router.get("/login", isLoggedIn, (req, res) => {
    res.render("login"); // Zorg voor een 'login.ejs' of een andere view
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    const user = await db.collection("users").findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        req.flash("error", "Ongeldige gebruikersnaam of wachtwoord.");
        return res.redirect("/login");
    }

    // Zet de sessie-id van de gebruiker
    req.session.userId = user._id.toString(); // Zet userId in de sessie
    console.log("User session ID:", req.session.userId);
    res.redirect("/"); // Redirect naar de expense tracker
});

// Uitloggen
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Fout bij het uitloggen.");
        }
        res.redirect("/login");
    });
});

export default router;