import * as readline from 'readline-sync';
import { Footballer, ClubDetail } from './interfaces';
import footballersData from "./json/footballers.json";
import clubsData from "./json/clubs.json";


function viewAllData(): void {
    footballersData.forEach((footballer: Footballer) => {
        console.log(`
            ID: ${footballer.id}
            Name: ${footballer.name}
            Description: ${footballer.description}
            Age: ${footballer.age}
            Active: ${footballer.active ? 'Yes' : 'No'}
            Date of Birth: ${footballer.dateOfBirth}
            Profile Picture: ${footballer.profilePicture}
            Status: ${footballer.status}
            Hobbies: ${footballer.hobbies.join(', ')}
            Club Details:
                ID: ${footballer.clubDetails.id}
                Club Name: ${footballer.clubDetails.clubName}
                Founded: ${footballer.clubDetails.founded}
                Stadium: ${footballer.clubDetails.stadium}
                Logo: ${footballer.clubDetails.logo}
        `);
    });
}

function filterByID(): void {
    const id = readline.question('Enter the ID to filter by: ');
    const filteredFootballer = footballersData.find((footballer: Footballer) => footballer.id === parseInt(id));

    if (filteredFootballer) {
        console.log(`
            ID: ${filteredFootballer.id}
            Name: ${filteredFootballer.name}
            Description: ${filteredFootballer.description}
            Age: ${filteredFootballer.age}
            Active: ${filteredFootballer.active ? 'Yes' : 'No'}
            Date of Birth: ${filteredFootballer.dateOfBirth}
            Profile Picture: ${filteredFootballer.profilePicture}
            Status: ${filteredFootballer.status}
            Hobbies: ${filteredFootballer.hobbies.join(', ')}
            Club Details:
                ID: ${filteredFootballer.clubDetails.id}
                Club Name: ${filteredFootballer.clubDetails.clubName}
                Founded: ${filteredFootballer.clubDetails.founded}
                Stadium: ${filteredFootballer.clubDetails.stadium}
                Logo: ${filteredFootballer.clubDetails.logo}
        `);
    } else {
        console.log('No footballer found with that ID.');
    }
}

function main(): void {
    console.log('Welcome to the FootballDataViewer!\n');

    while (true) {
        console.log('1. View all data');
        console.log('2. Filter by ID');
        console.log('3. Exit\n');

        const choice = readline.question('Enter your choice: ');

        switch (choice) {
            case '1':
                viewAllData();
                break;
            case '2':
                filterByID();
                break;
            case '3':
                console.log('Goodbye!');
                return;
            default:
                console.log('Invalid choice. Please try again.\n');
        }
    }
}

main();
