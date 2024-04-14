const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;
const footballersData = require('../json/footballers.json');


app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
  res.send('Welcome to the Football Data Viewer!');
});

app.get('/overview', (req, res) => {
  // Pad naar het HTML-bestand
  const filePath = path.join(__dirname, 'public', 'overview.html');

  // Stuur het HTML-bestand als reactie naar de client
  res.sendFile(filePath);
});

app.get('/filter', (req, res) => {
  const { name } = req.query;

  // Filter de voetballersgegevens op basis van de ingevoerde naam
  const filteredFootballers = footballersData.filter(footballer =>
    footballer.name.toLowerCase().includes(name.toLowerCase())
  );

  // Definieer de HTML-sjabloon voor de overzichtspagina met de gefilterde resultaten
  const filteredOverviewPage = `
    <h1>Filtered Footballers Overview</h1>
    <p>Showing results for: ${name}</p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Active</th>
          <th>Club</th>
        </tr>
      </thead>
      <tbody>
        ${filteredFootballers.map(footballer => `
          <tr>
            <td>${footballer.name}</td>
            <td>${footballer.age}</td>
            <td>${footballer.active ? 'Yes' : 'No'}</td>
            <td>${footballer.clubDetails.clubName}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Stuur de HTML-sjabloon met de gefilterde resultaten als reactie naar de client
  res.send(filteredOverviewPage);
});


app.get('/sort', (req, res) => {
  const { sortBy, sortOrder } = req.query;

  // Sorteer de voetballersgegevens op basis van de geselecteerde kolom en sorteerorde
  let sortedFootballers = [...footballersData];
  if (sortBy && sortOrder) {
    sortedFootballers.sort((a, b) => {
      const aValue = (sortBy === 'age') ? a[sortBy] : a[sortBy].toLowerCase();
      const bValue = (sortBy === 'age') ? b[sortBy] : b[sortBy].toLowerCase();
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // Stuur de gesorteerde voetballersgegevens terug naar de overzichtspagina
  res.send(sortedFootballers);
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});