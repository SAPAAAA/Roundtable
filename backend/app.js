import express from 'express'
import cors from 'cors'

import authRoutes from '#routes/auth.routes.js'

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
}

app.use('/api', cors(options), authRoutes)


app.listen(5000, () => {
    console.log('Server running on port 5000')
})