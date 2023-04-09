// Description: This file contains the User model.

// Importing the mongoose library
const mongoose = require("mongoose");
// Creating a Schema object
const Schema = mongoose.Schema;

// Creating a UserSchema object
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
});

// Creating a User model
const User = mongoose.model("registered_users_pokedex", UserSchema);

// Exporting the User model
module.exports = User;
