// Import mongoose
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
    // Try to connect to MongoDB, else throw an error
  try {
    await mongoose.connect("mongodb://localhost:27017/pokedex", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

// Export the connectDB function
module.exports = connectDB;
