
module.exports = {
      development: {
          username: "postgres",  
          password: "admin",  
          database: "db_2ndhand",
          host: "127.0.0.1",
          dialect: "postgres"
      },
      test: {
          username: "postgres",
          password: "admin",
          database: "db_2ndhand",
          host: "127.0.0.1",
          dialect: "postgres"
      },
      production: {
          username: process.env.PROD_DB_USERNAME,
          password: process.env.PROD_DB_PASSWORD,
          database: process.env.PROD_DB_NAME,
          host: process.env.PROD_DB_HOST,
          port: parseInt(process.env.PROD_DB_PORT),
          url: `postgres://${process.env.PROD_DB_USERNAME}:${process.env.PROD_DB_PASSWORD}@${process.env.PROD_DB_HOST}:${process.env.PROD_DB_PORT}/${process.env.PROD_DB_NAME}`,
          dialect: "postgres",
          dialectOptions: {
            ssl: { 
              require: true,
              rejectUnauthorized: false
            }
          }  
      },
      test_production: {
          username: process.env.TEST_DB_USERNAME,
          password: process.env.TEST_DB_PASSWORD,
          database: process.env.TEST_DB_NAME,
          host: process.env.TEST_DB_HOST,
          port: parseInt(process.env.TEST_DB_PORT),
          url: `postgres://${process.env.TEST_DB_USERNAME}:${process.env.TEST_DB_PASSWORD}@${process.env.TEST_DB_HOST}:${process.env.TEST_DB_PORT}/${process.env.TEST_DB_NAME}`,
          dialect: "postgres",
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
      }
    };