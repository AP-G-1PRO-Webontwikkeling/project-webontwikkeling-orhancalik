// Importeer de benodigde modules
import express from 'express';
import path from 'path';
import footballersData from '../data/footballers.json';
import clubsData from '../data/clubs.json';
// Maak een Express-applicatie
const app = express();
const PORT = 3000;



// Middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Welkomstpagina route
app.get('/', (req, res) => {
    res.render('index');
});

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
