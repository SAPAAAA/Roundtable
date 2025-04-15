import knexObj from 'knex';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const postgres = knexObj({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    pool: {min: 0, max: 7},
});

// Export the database connection
export default postgres;
