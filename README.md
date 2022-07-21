![staging](https://github.com/Doritos7/second-hand-backend/actions/workflows/staging.yml/badge.svg) 
![main](https://github.com/Doritos7/second-hand-backend/actions/workflows/main.yml/badge.svg)

# [Backend] Second Hand Product

<p align="center">
  <img width=150 src="https://storage.googleapis.com/secondhand-be-test.appspot.com/images/secondhand.png" alt="Logo" align="center">
</p>


This is a Backend Repository for Second Hand Products Application. To complete the MSIB Binar Academy capstone project. Feel free to contribute or fork. 


## Also see 
- [Staging Deploy Backend](https://secondhand-be-test.herokuapp.com)
- [Frontend Repository](https://github.com/Doritos7/second-hand-frontend)


## How to use

1. Install the dependencies : ``` npm install ```
2. Make project on firebase, add storage in your project, go to GCP to make bucket storage public
2. Setup .env file : copy the .env.example to .env and fill the values
3. Create Database : ``` sequelize db:create || npx sequelize-cli db:create ```
4. Run Migrations : ``` sequelize db:migrate || npx sequelize-cli db:migrate ```
5. Run Seeders : ``` sequelize db:seed:all || npx sequelize-cli db:seed:all ```
6. Run Project : ``` npm start ```
7. See API Documentation :  Go to ```{{server}}/docs``` to see the Swagger API documentation . 

## Tech
The main Technology what we use to build this application is:

1. Node.js
2. Express.js
3. Sequelize ORM
4. Passport.js
5. PostgreSQL
6. Firebase Storage
7. Swagger Documentation
