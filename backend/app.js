import express from 'express'
import session from 'express-session'
import {RedisStore} from 'connect-redis';
import cors from 'cors'
import dotenv from 'dotenv'
import redis from '#db/redis.js'

import authRoutes from '#routes/auth.routes.js'
import postRoutes from "#routes/post.routes.js";
import voteRoutes from "#routes/vote.routes.js";
import commentRoutes from "#routes/comment.routes.js";

dotenv.config()

const app = express()

app.use(express.json());

app.use(express.urlencoded({extended: true}));

const allowedOrigins = [
    'http://localhost:3000',
]

const options = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)
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

app.use(cors(options))
app.set('trust proxy', 1)
app.use(
    session({
        store: redisStore,
        secret: process.env.SESSION_SECRET_KEY || 'secret',
        rolling: true,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: (process.env.SESSION_EXPIRATION_TIME || 60 * 30) * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        }
    })
)

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/comments', commentRoutes);

app.listen(6000, () => {
    console.log('Server running on port 6000')
});

