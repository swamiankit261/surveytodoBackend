import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database.
 */
const connectDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/surveys`);
        console.log(`\n\nMongoDB connected! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit the process if the database connection fails
    }
};

/**
 * Disconnects from the MongoDB database.
 */
const disconnectDatabase = async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed successfully.");
    } catch (error) {
        console.error("Error closing MongoDB connection:", error);
        throw error; // Re-throw the error for further handling if needed
    }
};

export { connectDatabase, disconnectDatabase };