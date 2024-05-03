function sortTable(field) {
    const tbody = document.getElementById('tableBody');
    const rows = Array.from(tbody.getElementsByTagName('tr'));
    const sortedRows = rows.sort((a, b) => {
        const textA = a.getElementsByTagName('td')[field];
        const textB = b.getElementsByTagName('td')[field];
        return textA.textContent.localeCompare(textB.textContent, 'en', { sensitivity: 'base' });
    });
    tbody.innerHTML = '';
    sortedRows.forEach(row => tbody.appendChild(row));}