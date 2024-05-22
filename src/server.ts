import express from 'express';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { MongoClient, Db, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
app.use(session({
    secret: 'geheim', // Willekeurige string gebruikt om sessiegegevens te coderen
    resave: false,
    saveUninitialized: true
}));

const mongoURI: string = process.env.MONGO_URI ?? '';
const dbName = process.env.DB_NAME ?? '';
const client = new MongoClient(mongoURI);
let mongoClient: MongoClient;

let db: Db;



async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Aantal zout-rondes (10 wordt aanbevolen)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

declare module 'express-session' {
    interface Session {
        loggedIn: boolean;
        username: string;
        role: string;
        // Voeg andere sessiegegevens toe indien nodig
    }
}
interface Footballer {
    _id: ObjectId;
    name: string;
    age: number;
    position: string;
    club: string;
    profilePicture?: string;
    description: string;
    hobbies?: string[];
}

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Verbonden met MongoDB');
        db = client.db(dbName);
        mongoClient = client; // Sla het MongoClient-object op
    } catch (error) {
        console.error('Fout bij het verbinden met MongoDB:', error);
    }
}

async function importFootballersDataToMongoDB() {
    try {
        const footballersDataPath = path.join(__dirname, '../data/footballers.json');
        const footballersData = await fs.promises.readFile(footballersDataPath, 'utf-8');
        const footballers: Footballer[] = JSON.parse(footballersData);

        const collection = db.collection('footballers');

        const count = await collection.countDocuments();
        if (count > 0) {
            console.log('Footballers data is already in the database.');
            return;
        }

        const result = await collection.insertMany(footballers);
        console.log(`${result.insertedCount} documents were inserted into the footballers collection.`);
    } catch (error) {
        console.error('Error importing footballers data to MongoDB:', error);
    }
}

async function importClubsDataToMongoDB() {
    try {
        const clubsDataPath = path.join(__dirname, '../data/clubs.json');
        const clubsData = await fs.promises.readFile(clubsDataPath, 'utf-8');
        const clubs = JSON.parse(clubsData);

        const collection = db.collection('clubs');
        const count = await collection.countDocuments();
        if (count === 0) {
            const result = await collection.insertMany(clubs);
            console.log(`${result.insertedCount} documents were inserted into the clubs collection.`);
        } else {
            console.log(`Clubs collection already contains data.`);
        }
    } catch (error) {
        console.error('Error importing clubs data to MongoDB:', error);
    }
}

async function createDefaultUsers() {
    try {
        const usersCollection = db.collection('users');

        // Controleer of de gebruikers al bestaan
        const adminExists = await usersCollection.findOne({ username: 'admin' });
        const userExists = await usersCollection.findOne({ username: 'user' });

        if (!adminExists) {
            const adminUser = {
                username: 'admin',
                password: await hashPassword('1234'),
                role: 'ADMIN'
            };
            await usersCollection.insertOne(adminUser);
        }

        if (!userExists) {
            const userUser = {
                username: 'user',
                password: await hashPassword('1234'),
                role: 'USER'
            };
            await usersCollection.insertOne(userUser);
        }

        console.log('Standaardgebruikers zijn aangemaakt (indien nodig).');
    } catch (error) {
        console.error('Fout bij het aanmaken van standaardgebruikers:', error);
    }
}


connectToMongoDB().then(() => {
    importFootballersDataToMongoDB();
    importClubsDataToMongoDB();
    createDefaultUsers();
});

function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    next();
}

// Middleware om ervoor te zorgen dat de gebruiker een admin is
function ensureAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.session.role !== 'ADMIN') {
        return res.status(403).send('Toegang verboden');
    }
    next();
}

// Middleware om ingelogde gebruikers om te leiden van de loginpagina
function redirectIfLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (req.session.loggedIn) {
        return res.redirect('/overview');
    }
    next();
}


// Welkomstpagina route
app.get('/', (req: Request, res: Response) => {
    res.render('index', { session: req.session });
});

app.get('/overview', ensureLoggedIn, async (req: Request, res: Response) => {
    const collection = db.collection('footballers');
    const footballers = await collection.find().toArray();
    res.render('overview', { footballers, session: req.session });
});

app.get('/detail/:id', ensureLoggedIn, async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const collection = db.collection('footballers');
        const footballer = await collection.findOne({ _id: new ObjectId(id) });

        if (!footballer) {
            res.status(404).send('Voetballer niet gevonden');
            return;
        }

        res.render('detail', { footballer, session: req.session });
    } catch (error) {
        console.error('Fout bij het ophalen van de voetballer:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de voetballer.');
    }
});

app.get('/club/:id', ensureLoggedIn, async (req: Request, res: Response) => {
    const clubId = parseInt(req.params.id);
    const collection = db.collection('clubs');
    const club = await collection.findOne({ id: clubId });

    if (!club) {
        return res.status(404).send('Club niet gevonden');
    }

    res.render('club', { club, session: req.session });
});

app.get('/edit/:id', ensureLoggedIn, ensureAdmin, async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        console.log('Edit pagina opgevraagd voor ID:', id);
        const collection = db.collection('footballers');
        console.log('Ontvangen ID voor bewerking:', id); // Nieuwe logging toegevoegd
        const footballer = await collection.findOne({ _id: new ObjectId(id) }) as Footballer;

        if (!footballer) {
            console.log('Voetballer niet gevonden voor ID:', id);
            res.status(404).send('Voetballer niet gevonden');
            return;
        }

        console.log('Voetballer gevonden voor bewerking:', footballer);
        res.render('edit', { footballer, session: req.session });
    } catch (error) {
        console.error('Fout bij het ophalen van de voetballer:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de voetballer.');
    }
});

app.post('/edit/:id', ensureLoggedIn, ensureAdmin, async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, age, position, club, description, hobbies } = req.body;

    try {
        const collection = db.collection('footballers');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, age, position, club, description, hobbies: hobbies ? hobbies.split(',') : [] } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('Voetballer niet gevonden');
        }

        res.redirect('/overview');
    } catch (error) {
        console.error('Fout bij het bijwerken van de voetballer:', error);
        res.status(500).send('Er is een fout opgetreden bij het bijwerken van de voetballer.');
    }
});

app.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('login', { session: req.session });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Inlogpoging ontvangen voor gebruikersnaam:', username); // Log de ontvangen gebruikersnaam

    try {
        // Controleer of de gebruiker bestaat en of het wachtwoord overeenkomt
        const usersCollection = mongoClient.db(dbName).collection('users');
        const user = await usersCollection.findOne({ username });

        if (user) {
            console.log('Gebruiker gevonden in de database:', user);
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                console.log('Inlogpoging geslaagd voor gebruiker:', username);
                // Inloggen gelukt, stuur door naar het dashboard
                req.session.loggedIn = true;
                req.session.username = username;
                req.session.role = user.role; // Stel de rol in op basis van de gebruikersgegevens uit de database
                res.redirect('/dashboard');
                return;
            }
        }

        // Loggen als de inlogpoging mislukt
        console.log('Inlogpoging mislukt voor gebruiker:', username);
        res.render('login', { error: 'Ongeldige inloggegevens' });
    } catch (error) {
        console.error('Fout bij het verwerken van inlogpoging:', error);
        res.status(500).send('Er is een fout opgetreden bij het verwerken van de inlogpoging.');
    }
});

app.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Uitloggen mislukt');
        }
        res.redirect('/login');
    });
});

app.get('/register', (req: Request, res: Response) => {
    res.render('register', { session: req.session });
});

app.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const usersCollection = mongoClient.db(dbName).collection('users');
    const userExists = await usersCollection.findOne({ username });

    if (userExists) {
        return res.render('register', { error: 'Gebruikersnaam bestaat al', session: req.session });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = { username, password: hashedPassword, role: 'USER' };

    await usersCollection.insertOne(newUser);

    res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
    console.log(req.session);
    res.render('dashboard', { role: req.session.role });
});

app.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Uitloggen mislukt');
        }
        res.redirect('/login');
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});