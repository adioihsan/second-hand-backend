![staging](https://github.com/Doritos7/second-hand-backend/actions/workflows/staging.yml/badge.svg) 
![main](https://github.com/Doritos7/second-hand-backend/actions/workflows/main.yml/badge.svg)

# [Backend] Second Hand Product

<p align="center">
  <img width=150 src="https://storage.googleapis.com/secondhand-be-test.appspot.com/images/secondhand.png" alt="Logo" align="center">
</p>


This is a Backend Repository for Second Hand Products Application. To complete the MSIB Binar Academy capstone project. Feel free to contribute or fork. 


## Also see 
- [Staging Deploy Backend](https://secondhand-be-test.herokuapp.com/docs)
- [Production Deploy Backend](https://secondhand-be-test.herokuapp.com/docs)
- [Staging Deploy Frontend](https://secondhand-test.herokuapp.com)
- [Production Deploy Frontend](https://second-hand-lac.vercel.app)
- [Frontend Repository](https://github.com/Doritos7/second-hand-frontend)


## How to use

1. Install the dependencies : ``` npm install ```
2. Make project on firebase, add the firebase storage to your project and add firebase cloud messaging
3. Download all credentials that needed for the project
4. Setup .env file : copy the .env.example to .env and fill the values
5. Create Database : ``` sequelize db:create || npx sequelize-cli db:create ```
6. Run Migrations : ``` sequelize db:migrate || npx sequelize-cli db:migrate ```
7. Run Seeders : ``` sequelize db:seed:all || npx sequelize-cli db:seed:all ```
8. Run Project : ``` npm start ```
9. See API Documentation :  Go to ```{{server}}/docs``` to see the Swagger API documentation . 

## Tech
The main Technology what we use to build this application is:

1. Node.js
2. Express.js
3. Sequelize ORM
4. Passport.js
5. PostgreSQL
6. Firebase Storage
7. Socket.io
8. Firebase Cloud Messaging
9. Swagger Documentation
