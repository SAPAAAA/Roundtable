import knexObj from 'knex';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const postgres = knexObj({
    client: 'pg',
    connection: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB
    },
    pool: {min: 0, max: 7},
});

// Export the database connection
export default postgres;
