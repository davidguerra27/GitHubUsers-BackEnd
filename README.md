# GitHubUsers-BackEnd
 The goal was to develop a command-line application using NodeJS + TypeScript (or just Javascript/NodeJS) + PostgreSQL, whose goals are:

- Fetch information about a given GitHub user (passed as a command-line argument) using the [GitHub API](https://docs.github.com/en/rest);
- Using a different command-line option, it should be possible to fetch and display all users already on the database (showing them on the command line);
- Finally, the application should also be able query a user per location and/or programming languages;



## Pre-requisites
Before you can use this application, you'll need to have the following things installed on your machine:

- Node.js
- A PostgreSQL server to connect to
## Installation
To install the application, after launching the server, follow these steps:

    1. Clone the repository:

```bash
    git clone https://github.com/davidguerra27/Back-End-Test.git

```
    2. Navigate to the directory:
```bash
    cd Back-End-Test
```
    3. Install the dependencies:
```bash
    npm install
```
    4. Setup the database:
```bash
    node app.js dbsetup
```  
    5. Create the table: 
```bash
    node app.js tbsetup
``` 
## Usage
To use the application, run the following commands:

    1. Fetch User from GitHub API:
```bash
    node app.js get <username>
```
    2. Display Users already stored:
```bash
    node app.js display
```
    3. Display Users from database by location:
```bash
    node app.js location <location>
```
    4. Display Users from database by language:
```bash
    node app.js language <language> 
```




## Authors

- [@davidguerra27](https://www.github.com/davidguerra27)

