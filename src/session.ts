// session.ts
import session, { SessionData } from 'express-session';
import mongoDbSession from 'connect-mongodb-session';
import dotenv from 'dotenv';

dotenv.config();

const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: process.env.MONGO_URI ?? 'mongodb://localhost:27017',
    collection: 'sessions',
    databaseName: 'Bobkes',
});

mongoStore.on("connected", () => {
    console.log("MongoDB session store connected");
});

// Breid de SessionData interface uit om userId toe te voegen
declare module 'express-session' {
    export interface SessionData {
        userId?: string;  // Voeg userId toe als een optioneel veld
        user?: string;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? 'your-secret-key',
    store: mongoStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
});