import * as readline from 'readline-sync';
import { Character, Weapon } from './interfaces';

async function fetchCharacters(): Promise<Character[]> {
    const response = await fetch('https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-RMA1040/main/json/characters.json');
    if (!response.ok) {
        throw new Error('error');
    }
    const characters: Character[] = await response.json();
    return characters;
}

async function runApplication() {
    console.log(`\x1b[36mWelcome to the Elementex!\x1b[0m\n`);
    
    try {
        const characters = await fetchCharacters();

        while (true) {
            console.log(`\x1b[32m1. View all data`);
            console.log(`2. Filter by ID (example: CHAR-0003)\x1b[0m`);
            console.log(`\x1b[31m3. Exit\x1b[0m\n`);

            let choice = readline.questionInt("Please enter your choice: ");

            if (choice === 1) {
                characters.forEach((character: Character) => {
                    // Your logic to display each character's information
                });
                console.log();
            } else if (choice === 2) {
                const choiceID = readline.question("Please enter the ID you want to filter by: ");
                const filteredCharacter = characters.find((character: Character) => character.ID.toUpperCase() === choiceID.toUpperCase());
                if (filteredCharacter) {
                    // Your logic to display the filtered character's information
                } else {
                    console.log(`Character with ID ${choiceID} not found.`);
                }
            } else if (choice === 3) {
                console.log("Exiting...");
                break;
            } else {
                console.log(`\x1b[31mSorry, ${choice} is not a valid choice. Try again.\x1b[0m\n`);
            }
        }
    } catch (error) {
        console.error("Failed to fetch characters:", error);
    }
}

runApplication();
