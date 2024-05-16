import express from 'express';
import path from 'path';
import fs from 'fs';
import { MongoClient, Db, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.urlencoded({ extended: true }));

const mongoURI: string = process.env.MONGO_URI ?? '';
const dbName = process.env.DB_NAME ?? '';
const client = new MongoClient(mongoURI);
let db: Db;

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

connectToMongoDB().then(() => {
    importFootballersDataToMongoDB();
    importClubsDataToMongoDB();
});

// Welkomstpagina route
app.get('/', (req, res) => {
    res.render('index');
});

// Voetballers overzichtspagina route
app.get('/overview', async (req, res) => {
    const collection = db.collection('footballers');
    const footballers = await collection.find().toArray();
    res.render('overview', { footballers });
});

// Voetballer detailpagina route
app.get('/detail/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const collection = db.collection('footballers');
        const footballer = await collection.findOne({ _id: new ObjectId(id) });

        if (!footballer) {
            res.status(404).send('Voetballer niet gevonden');
            return;
        }

        res.render('detail', { footballer });
    } catch (error) {
        console.error('Fout bij het ophalen van de voetballer:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de voetballer.');
    }
});
// Club detailpagina route
app.get('/club/:id', async (req, res) => {
    const clubId = parseInt(req.params.id);
    const collection = db.collection('clubs');
    const club = await collection.findOne({ id: clubId });

    if (!club) {
        return res.status(404).send('Club niet gevonden');
    }

    res.render('club', { club });
});

// Route voor het weergeven van het bewerkingsformulier
app.get('/edit/:id', async (req, res) => {
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
        res.render('edit', { footballer });
    } catch (error) {
        console.error('Fout bij het ophalen van de voetballer:', error);
        res.status(500).send('Er is een fout opgetreden bij het ophalen van de voetballer.');
    }
});

app.post('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { name, age, position, description } = req.body; // Verwijder description en profilePicture

    try {
        console.log('Bewerkingsverzoek ontvangen voor ID:', id);
        const collection = db.collection('footballers');
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                name,
                age: parseInt(age, 10),
                position,
                description
            }
        };

        const result = await collection.updateOne(filter, updateDoc);

        if (result.modifiedCount === 1) {
            console.log('Voetballer succesvol bijgewerkt:', id);
            res.redirect('/overview');
        } else {
            console.log('Fout bij het bijwerken van de voetballer:', id);
            res.status(500).send('Er is een fout opgetreden bij het bijwerken van de gegevens.');
        }
    } catch (error) {
        console.error('Fout bij het bewerken van de voetballer:', error);
        res.status(500).send('Er is een fout opgetreden bij het bewerken van de voetballer.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
