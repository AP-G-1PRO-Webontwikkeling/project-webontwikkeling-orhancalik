// Functie om de tabel te sorteren
function sortTable(columnIndex) {
    const table = document.querySelector('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Bepaal de sorteerrichting op basis van het huidige icoon in de kolomkop
    const currentIcon = table.querySelector(`th:nth-child(${columnIndex + 1}) .sort-icon`);
    const isAscending = currentIcon.classList.contains('asc');

    // Verwijder de sorteerpictogrammen van alle kolomkoppen
    table.querySelectorAll('.sort-icon').forEach(icon => {
        icon.textContent = '';
    });

    // Wissel de sorteerrichting om en update het pictogram in de huidige kolomkop
    currentIcon.textContent = isAscending ? '▼' : '▲';
    currentIcon.classList.toggle('asc', !isAscending);

    // Sorteer de rijen op basis van de inhoud van de geselecteerde kolom
    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();
        return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    // Voeg de gesorteerde rijen opnieuw toe aan de tabel
    rows.forEach(row => tbody.appendChild(row));
}

// Functie om de tabel te filteren op basis van de ingevoerde tekst
function filterTable() {
    const searchText = document.getElementById('searchInput').value.trim().toLowerCase();
    const rows = document.getElementById('tableBody').getElementsByTagName('tr');

    for (let row of rows) {
        const nameCell = row.getElementsByTagName('td')[0];
        if (nameCell) {
            const name = nameCell.textContent.trim().toLowerCase();
            row.style.display = name.includes(searchText) ? '' : 'none'; // Toon of verberg de rij op basis van de zoekterm
        }
    }
}

// Voeg een event listener toe aan het zoekveld om de tabel te filteren wanneer de invoer verandert
document.getElementById('searchInput').addEventListener('input', filterTable);