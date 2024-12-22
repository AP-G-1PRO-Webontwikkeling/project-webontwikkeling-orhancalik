import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { connectToDatabase } from "./database";
import flash from "connect-flash";
import expensesRouter from "./routes/expenses";
import authRouter from "./routes/authRouter";
import sessionMiddleware from "./session";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(sessionMiddleware);
app.use(flash());

app.use((req, res, next) => {
    res.locals.successMessage = req.flash("success");
    res.locals.errorMessage = req.flash("error");
    res.locals.warningMessage = req.flash('warning'),
        next();
});


app.use("/", expensesRouter);
app.use("/", authRouter);


app.get("/check-session", (req, res) => {
    if (req.session.userId) {
        res.json({ message: "Session is active", userId: req.session.userId });
    } else {
        res.json({ message: "No active session" });
    }
});


connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server draait op http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Kan de server niet starten:", err);
});