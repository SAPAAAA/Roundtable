import {createClient} from 'redis'; // Correct import for redis v4+
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisTlsEnabled = process.env.REDIS_TLS_ENABLED === 'true';

const clientOptions = {
    socket: {
        host: redisHost,
        port: Number(redisPort),
        tls: redisTlsEnabled,
        rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : undefined,
    }
};

// For debugging
console.log("Attempting to connect to Redis with options:", JSON.stringify(clientOptions.socket));

const client = createClient(clientOptions);

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Redis Client: Establishing connection...')); // Fired when the socket connection is established
client.on('ready', () => console.log('Redis Client: Ready! (Connected and ready to process commands)')); // Fired when client is ready to send commands
client.on('end', () => console.log('Redis Client: Connection closed.')); // Fired when the connection has been closed
client.on('reconnecting', () => console.log('Redis Client: Reconnecting...')); // Fired when client is attempting to reconnect

// Attempt to connect when the module loads.
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Redis Client: Initial connection attempt failed. Client will attempt to reconnect.', err.message);
    }
})();

export default client;