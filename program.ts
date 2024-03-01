import * as readline from 'readline-sync';
import { Voetballer, ClubDetail } from './interfaces';
import voetballers from "./json/voetballers.json";
import clubsData from "./json/clubs.json";


function viewAllData(): void {
    voetballers.forEach((voetballer: Voetballer) => {
        console.log(`
            ID: ${voetballer.id}
            Naam: ${voetballer.naam}
            Beschrijving: ${voetballer.beschrijving}
            Leeftijd: ${voetballer.leeftijd}
            Actief: ${voetballer.actief ? 'Ja' : 'Nee'}
            Geboortedatum: ${voetballer.geboortedatum}
            Profielfoto: ${voetballer.profielfoto}
            Status: ${voetballer.status}
            Hobbies: ${voetballer.hobbies.join(', ')}
            Club Details:
                ID: ${voetballer.club_details.id}
                Clubnaam: ${voetballer.club_details.clubnaam}
                Opgericht: ${voetballer.club_details.opgericht}
                Stadion: ${voetballer.club_details.stadion}
                Logo: ${voetballer.club_details.logo}
        `);
    });
}

function filterByID(): void {
    const id = readline.question('Voer het ID in om op te filteren: ');
    const filteredVoetballer = voetballers.find((voetballer: Voetballer) => voetballer.id === parseInt(id));

    if (filteredVoetballer) {
        console.log(`
            ID: ${filteredVoetballer.id}
            Naam: ${filteredVoetballer.naam}
            Beschrijving: ${filteredVoetballer.beschrijving}
            Leeftijd: ${filteredVoetballer.leeftijd}
            Actief: ${filteredVoetballer.actief ? 'Ja' : 'Nee'}
            Geboortedatum: ${filteredVoetballer.geboortedatum}
            Profielfoto: ${filteredVoetballer.profielfoto}
            Status: ${filteredVoetballer.status}
            Hobbies: ${filteredVoetballer.hobbies.join(', ')}
            Club Details:
                ID: ${filteredVoetballer.club_details.id}
                Clubnaam: ${filteredVoetballer.club_details.clubnaam}
                Opgericht: ${filteredVoetballer.club_details.opgericht}
                Stadion: ${filteredVoetballer.club_details.stadion}
                Logo: ${filteredVoetballer.club_details.logo}
        `);
    } else {
        console.log('Geen voetballer gevonden met dat ID.');
    }
}

function main(): void {
    console.log('Welkom bij de VoetbalDataViewer!\n');

    while (true) {
        console.log('1. Bekijk alle data');
        console.log('2. Filter op ID');
        console.log('3. Exit\n');

        const choice = readline.question('Voer uw keuze in: ');

        switch (choice) {
            case '1':
                viewAllData();
                break;
            case '2':
                filterByID();
                break;
            case '3':
                console.log('Tot ziens!');
                return;
            default:
                console.log('Ongeldige keuze. Probeer opnieuw.\n');
        }
    }
}

main();