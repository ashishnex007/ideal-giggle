const { MongoClient } = require('mongodb');
require('dotenv').config();

// Replace this with your MongoDB connection string
const uri = process.env.DB_CONNECTION_STRING;
const dbName = "test";

async function clearDatabase() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);

        // Get all collection names in the database
        const collections = await db.listCollections().toArray();

        // Drop each collection
        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`Dropped collection: ${collection.name}`);
        }

        console.log("All collections dropped successfully.");
    } catch (error) {
        console.error("Error clearing database:", error);
    } finally {
        await client.close();
    }
}

clearDatabase();