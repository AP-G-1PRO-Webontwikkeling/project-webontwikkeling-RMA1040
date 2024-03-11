import * as readline from 'readline-sync';
import { Character, Weapon } from './interfaces';

async function fetchCharacters(): Promise<Character[]> {
    const response = await fetch('https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-RMA1040/main/json/characters.json');
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
        console.log(`\x1b[35m- ${character.Names}\x1b[0m \x1b[96m-(${character.ID}\x1b[0m)\n`);
        });
    console.log();
    } 
    else if (choice === 2) {
        const choiceID = readline.question("Please enter the ID you want to filter by: ");
        const filteredCharacter = characters.find((character: Character) => character.ID.toUpperCase() === choiceID.toUpperCase());
        if (filteredCharacter) {
        console.log(`\x1b[35m- ${filteredCharacter.Names}\x1b[0m \x1b[96m-(${filteredCharacter.ID}\x1b[0m)\n  \x1b[96m- Description:\x1b[0m ${filteredCharacter.Description}\n  \x1b[96m- Age:\x1b[0m ${filteredCharacter.Age}\n  \x1b[96m- Alive:\x1b[0m ${filteredCharacter.isAlive}\n  \x1b[96m- Birthdate:\x1b[0m ${filteredCharacter.Birthday}\n  \x1b[96m- Image:\x1b[0m ${filteredCharacter.imageUrl}\n  \x1b[96m- Abilities:\x1b[0m ${filteredCharacter.abilities.join(", ")}\n  \x1b[96m- Element:\x1b[0m ${filteredCharacter.Elements}\n  \x1b[33m- Weapon:\x1b[0m ${filteredCharacter.Weapons.weapon_name}\n    \x1b[33m- WeaponID:\x1b[0m ${filteredCharacter.Weapons.weapon_id}\n    \x1b[33m- Weapon Power:\x1b[0m ${filteredCharacter.Weapons.weapon_power}\n    \x1b[33m- Origin:\x1b[0m ${filteredCharacter.Weapons.Origin}\n    \x1b[33m- Description:\x1b[0m ${filteredCharacter.Weapons.description}\n    \x1b[31m- Downside:\x1b[0m ${filteredCharacter.Weapons.downside}`);
        console.log();
    } 
    else {
        console.log(`Character with ID ${choiceID} not found.`);
    }
    } 
    else if (choice === 3) {
        console.log("Exiting...");
        break;
    } 
    else {
        console.log(`\x1b[31mSorry, ${choice} is not a valid choice. Try again.\x1b[0m\n`);
    }

}
} 
catch (error) {
    console.error("Failed to fetch characters:", error);
}
}

runApplication();
