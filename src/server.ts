// Importeer de benodigde modules
import express from 'express';
import path from 'path';
import fs from 'fs';
import footballersData from '../data/footballers.json';
import clubsData from '../data/clubs.json';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
// Maak een Express-applicatie
const app = express();
const PORT = 3000;

dotenv.config();

// Middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

const mongoURI: string | undefined = process.env.MONGO_URI ?? '';
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

// Welkomstpagina route
app.get('/', (req, res) => {
    res.render('index');
});

const client = new MongoClient(mongoURI);
let db: Db;

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
        // Controleer of de data al is geïmporteerd door te zoeken naar een document met 'imported: true'
        const collection = db.collection('footballers');

        // Logging toevoegen om te controleren of de MongoDB-collectie correct wordt geopend
        console.log('Collection:', collection);

        const isImported = await collection.findOne({ imported: true });

        // Logging toevoegen om te controleren of 'isImported' correct wordt ingesteld
        console.log('Is imported:', isImported);

        if (!isImported) {
            // Als de data nog niet is geïmporteerd, importeer deze dan
            const footballersDataPath = path.join(__dirname, '../data/footballers.json');
            const footballersData = await fs.promises.readFile(footballersDataPath, 'utf-8');
            const footballers = JSON.parse(footballersData);

            // Voeg de geïmporteerde veld 'imported: true' toe aan elk document
            footballers.forEach((footballer: any) => footballer.imported = true);

            // Voeg de gegevens toe aan de MongoDB-collectie
            const result = await collection.insertMany(footballers);
            console.log(`${result.insertedCount} documents were inserted into the footballers collection.`);
        } else {
            console.log('Data is al geïmporteerd. Overslaan...');
        }
    } catch (error) {
        console.error('Error importing footballers data to MongoDB:', error);
    }
}
connectToMongoDB().then(() => importFootballersDataToMongoDB());
// Dummy data


// Voetballers overzichtspagina route (veronderstelt dat je deze al hebt geïmplementeerd)
app.get('/overview', (req, res) => {
    const footballers = require('../data/footballers.json');
    res.render('overview', { footballers });
});

app.get('/detail/:id', (req, res) => {
    // Haal het ID op uit de URL-parameter
    const id = parseInt(req.params.id);

    // Zoek de voetballer met het overeenkomende ID
    const footballer = footballersData.find((item: { id: number; }) => item.id === id);

    // Controleer of de voetballer is gevonden
    if (!footballer) {
        // Als de voetballer niet is gevonden, render een foutpagina of geef een foutmelding terug
        res.status(404).send('Voetballer niet gevonden');
        return;
    }

    // Render de detailpagina en geef de voetballer door aan de template
    res.render('detail', { footballer });
});
app.get('/club/:id', (req, res) => {
    const clubId = req.params.id;

    // Vind de club met de opgegeven ID in de JSON-array
    const club = clubsData.find(club => club.id === parseInt(clubId));

    if (!club) {
        return res.status(404).send('Club not found');
    }

    // Render de clubdetailpagina met de gegevens van de gevonden club
    res.render('club', { club });
});


// Luister naar verzoeken op de opgegeven poort
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
