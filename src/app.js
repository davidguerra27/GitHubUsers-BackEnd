const { Pool } = require('pg');
const pgp = require('pg-promise')();

//PROMISSE TO ACCESS THE SERVER AND CREATE DATABASE-----INPUT REQUIRED
const dbCreate = pgp({
  host: 'localhost',
  port: 6600,
  user: '<username>',//CHANGE HERE TO THE USERNAME YOU CHOSE WHEM LAUNCHING THE SERVER
  password: '<password>'//CHANGE HERE TO THE PASSWORD YOU CHOSE WHEM LAUNCHING THE SERVER
});

//PROMISSE TO ACCESS THE DATABASE AND CREATE THE TABLE-----INPUT REQUIRED
const dbAccess = pgp({
  host: 'localhost',
  port: 6600,
  database: 'github_users',
  user: '<username>',//CHANGE HERE TO THE USERNAME YOU CHOSE WHEM LAUNCHING THE SERVER
  password: '<password>'//CHANGE HERE TO THE PASSWORD YOU CHOSE WHEM LAUNCHING THE SERVER
});

//POOL DATA USED TO CREATE NEW POOLS TO ACCESS THE DATABASE AND UPDATE THE TABLE-----INPUT REQUIRED
const poolData = {
  user: '<username>',//CHANGE HERE TO THE USERNAME YOU CHOSE WHEM LAUNCHING THE SERVER
  host: 'localhost',
  database: 'github_users',
  password: '<password>',//CHANGE HERE TO THE PASSWORD YOU CHOSE WHEM LAUNCHING THE SERVER
  port: 6600,
}; 

//CREATES THE DATABASE
async function databaseSetup() {
  try {
    //DROPS A DATABASE IF IT EXISTS
    await dbCreate.any(`
    DROP DATABASE IF EXISTS github_users;`);
    console.log("Database has been successfully dropped.");
  } catch (error) {
    console.error(error);
  }
  //CREATES A NEW ONE
  try {
    await dbCreate.any(`
    
    CREATE DATABASE github_users
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Portugal.1252'
    LC_CTYPE = 'Portuguese_Portugal.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = 1000
    IS_TEMPLATE = False;`);
    console.log("Database has been successfully setup.");
  } catch (error) {
    console.error(error);
  }
}

//CREATES THE TABLE
async function tableSetup() {

  try {
    //THE QUERY DROP THE TABLE TO CREATE A NEW ONE IF ONE ALREADY EXISTS 
    await dbAccess.any(
    `-- DROP TABLE IF EXISTS public.github_accounts;
    CREATE TABLE IF NOT EXISTS public.github_accounts
    (
        user_id integer NOT NULL,
        user_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
        location character varying(255) COLLATE pg_catalog."default",
        repositories integer, 
        languages character(255) COLLATE pg_catalog."default",
        CONSTRAINT github_accounts_pkey PRIMARY KEY (user_id)
    )
    
    TABLESPACE pg_default;
    ALTER TABLE IF EXISTS public.github_accounts
    OWNER to postgres;`);
    console.log("Table has been successfully created.");
  } catch (error) {
    console.error(error+"erro!!!!");
  }
}

//FETCHES AND STORES THE USER AND THE REPOSITORIES DATA IN THE DATABASE
async function fetchAndStoreGitHubUser() {
    const myArgs = process.argv;
    const finalArgs = myArgs.slice(myArgs.length - 1);
 
  try { 
    // FETCH THE REPOSITORIES DATA FROM THE GITHUB USERS API
    const repInfo = await fetch(`https://api.github.com/users/${finalArgs}/repos`);
    const repositories = await repInfo.json();
    //FOR EVERY REPOSITORY MAS THE LANGUAGE AND STORES IT IN A SET SO THERE'S NO DUPLICATES
    const languageSet = new Set(repositories.map(rep => rep.language));
    //CONVERTS IT BACK TO AN ARRAY TO BE STORED
    const languageArr = Array.from(languageSet);
    
    console.log("Repositories found : "+repositories.length)
    
    // FECTH THE USER DATA FROM THE GITHUB USERS API
    const userInfo = await fetch(`https://api.github.com/users/${finalArgs}`);
    const user = await userInfo.json();
    console.log("User found.")

    // CONNECTS TO THE DATABASE
    const pool = new Pool(poolData);

    // INSERTS THE DATA INTO THE TABLE
    const result = await pool.query(
      'INSERT INTO github_accounts (user_id, user_name, location,repositories,languages) VALUES ($1, $2, $3, $4, $5)',
      [user.id, user.login, user.location, user.public_repos, languageArr]
    );
    console.log('User stored successfully: '+result.rowCount + ' row(s) inserted.');
  
    // CLOSES THE CONNECTION OR DISPLAYS AN ERROR
    await pool.end();
  } catch (error) {
    console.error(error);
  }
}
//QUERYS THE DATABASE FOR ALL USERS AND ALL THEIR INFO
async function displayUsers() {

  try {
    const users = await dbAccess.any(`SELECT * FROM github_accounts`);
    console.log(users);
  } catch (error) {
    console.error(error+"No User has been fetched. Table is empty.");
  }
}
//QUERYS THE DATABASE FOR ALL USERS THAT MACTH THE SEARCHED LOCATION
async function displayUsersByLocation() {

    const myArgs = process.argv;
    const finalArgs = myArgs.slice(myArgs.length - 1);

    try {
      const users = await dbAccess.any(`SELECT * FROM github_accounts WHERE location LIKE '%${finalArgs}%'`);
      if(users.length == 0){
        return console.log('No users found on that location. Confirm the second argument.');
      }
      console.log(users);
    } catch (error) {
      console.error(error);
    }
}
//QUERYS THE DATABASE FOR ALL USERS THAT MACTH THE SEARCHED LANGUAGE  
async function displayUserPerLanguage() {
    const myArgs = process.argv;
    const finalArgs = myArgs.slice(myArgs.length - 1);  
  try {

    // Connect to the database
    const pool = new Pool(poolData);

    // query user per language
    const result = await pool.query(
      `SELECT * FROM github_accounts WHERE languages LIKE '%${finalArgs}%'`
    );
    console.log(result.rows);

    // End the database connection
    await pool.end();
  } catch (error) {
    console.error(error);
  }
}
//COMMAND MAP FOR ALL THE FUNCTIONALITIES
const mainFunctions = {
    
    dbsetup: databaseSetup,
    tbsetup: tableSetup,
    display: displayUsers,
    location: displayUsersByLocation,
    get: fetchAndStoreGitHubUser,
    language: displayUserPerLanguage,
};
//CHECKING THE USER INPUT COMMAND
function update(){
  const arg = process.argv[2]; // get the third argument (index 2)

  if (mainFunctions[arg]) {
    mainFunctions[arg]();
  }   
}  
//EXECUTING THE COMMAND
update();
