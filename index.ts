import * as readline from 'readline-sync';
import characters from `./json/characters.json`;
import weapons from `./json/weapons.json`;

export interface Character {
    ID: string,
    Names: string,
    Description: string,
    Age: number,
    Birthday: number,
    isAlive: Boolean,
    imageUrl: string,
    abilties: string[],
    Elements: string,
    Weapons: Weapons
};

export interface Weapons{
    Weapons: string,
    weapon_name: string,
    weapon_id: string,
    weapon_power: number,
    Origin: string,
    description: string,
    downside: string
};


console.log(`\x1b[32mWelcome to the Elementex\x1b[0m`);
console.log()
console.log(`\x1b[34m1. View complete data\x1b[0m`)
console.log(`\x1b[34m2. Filter by ID\x1b[0m`)
console.log(`\x1b[31m3. Exit\x1b[0m`)
console.log()

let choice:number = readline.questionInt("Please enter your choice (enter 1, 2 or 3): ");
if (choice === 1)
{
    characters.forEach(character => console.log(character.Names));
}
else if (choice ===2)
{

}
else if(choice ===3)
{

}
else
{
    console.log(`\x1b[31mSorry, ${choice} is not a valid choice. Try again.\x1b[0m`)
};
