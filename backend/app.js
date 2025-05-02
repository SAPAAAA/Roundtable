// backend/app.js
import express from 'express';
import session from 'express-session';
import {RedisStore} from 'connect-redis';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import {WebSocketServer} from 'ws';

// WebSocket
import WebSocketManager from '#core/websocket-manager.js';

// Database
import redis from '#db/redis.js';
import postgres from "#db/postgres.js";

// Routes
import authRoutes from '#routes/auth.routes.js';
import postRoutes from '#routes/post.routes.js';
import voteRoutes from '#routes/vote.routes.js';
import commentRoutes from '#routes/comment.routes.js';
import subtableRoutes from "#routes/subtable.routes.js";
import notificationRoutes from "#routes/notification.routes.js";
import homeRoutes from "#routes/home.routes.js"; // Thêm route mới

// Listeners
import '#listeners/notification.listener.js';

dotenv.config()

const app = express()

app.use(express.json());

app.use(express.urlencoded({extended: true}));

const allowedOrigins = [
    'http://localhost:3000',
]

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true)
        }
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.'
            return callback(new Error(msg), false)
        }
        return callback(null, true)
    },
    optionsSuccessStatus: 200,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
}

const redisStore = new RedisStore({
    client: redis,
    prefix: 'session:',
});

app.use(cors(corsOptions));
app.set('trust proxy', 1);

// Configure session middleware
const sessionMiddleware = session({
    store: redisStore,
    secret: process.env.SESSION_SECRET_KEY || 'your-very-strong-secret-key', // Use a strong secret from env vars
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (parseInt(process.env.SESSION_EXPIRATION_TIME, 10) || 30 * 60) * 1000, // Default 30 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }
});
app.use(sessionMiddleware);

// --- HTTP Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/s',subtableRoutes);
app.use('/api/home', homeRoutes);

// --- WebSocket Server Setup ---
const server = http.createServer(app);
const wss = new WebSocketServer({noServer: true});

server.on('upgrade', (request, socket, head) => {
    sessionMiddleware(request, {}, (err) => { // Pass empty response object and next() callback
        if (err) {
            console.error('[WebSocket Upgrade] Session parsing error:', err);
            socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
            socket.destroy();
            return;
        }

        const userId = request.session?.userId; // Access session data parsed by middleware

        if (userId) {
            console.log(`[WebSocket Upgrade] User authenticated via session: ${userId}`);
            // Proceed with WebSocket handshake
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request, userId); // Pass the authenticated userId
            });
        } else {
            console.log('[WebSocket Upgrade] Authentication failed (no userId in session).');
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
        }
    });
});

wss.on('connection', (ws, request, authenticatedUserId) => {
    console.log(`[WebSocket Server] Client connected (User ID: ${authenticatedUserId})`);

    if (!authenticatedUserId) {
        console.warn('[WebSocket Server] Connection established but userId was not identified during upgrade.');
        ws.close(1008, "User identification failed."); // 1008 = Policy Violation
        return;
    }

    // Add connection to the manager
    WebSocketManager.addConnection(authenticatedUserId, ws);

    // Handle messages received from this specific client
    ws.on('message', (message) => {
        try {
            // Attempt to parse as Buffer -> String -> JSON
            const messageString = message.toString();
            if (messageString === 'ping') {
                // console.log(`[WebSocket Server] Received ping from ${authenticatedUserId}`);
                ws.send('pong');
                return;
            }

            const data = JSON.parse(messageString);
            console.log(`[WebSocket Server] Received message from ${authenticatedUserId}:`, data);
        } catch (e) {
            console.error(`[WebSocket Server] Failed to parse message from ${authenticatedUserId} or invalid format:`, message.toString(), e);
            ws.send(JSON.stringify({type: 'ERROR', message: 'Invalid message format.'}));
        }
    });
});

// Start the HTTP server (which includes WebSocket handling)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`HTTP and WebSocket Server running on port ${PORT}`);
});

// --- Graceful Shutdown ---
const signals = {'SIGINT': 2, 'SIGTERM': 15};
Object.keys(signals).forEach((signal) => {
    process.on(signal, async () => {
        console.log(`\nReceived ${signal}. Shutting down gracefully...`);
        WebSocketManager.closeAllConnections(); // Close WebSocket connections
        server.close(() => {
            console.log('HTTP server closed.');
            // Close database connections
            redis.quit(() => {
                console.log('Redis connection closed.');
                process.exit(128 + signals[signal]);
            });
            postgres.destroy(() => {
                console.log('Postgres connection pool closed.');
            }); // Close Knex pool
        });
    });
});