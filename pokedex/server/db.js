// Import mongoose
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
    // Try to connect to MongoDB, else throw an error
  try {
    await mongoose.connect('mongodb+srv://user:aadyIKr3pF3lmefJ@cluster0.sl0wkjp.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true});
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

// Export the connectDB function
module.exports = connectDB;
