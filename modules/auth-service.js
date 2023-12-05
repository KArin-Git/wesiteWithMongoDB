const bcrypt = require('bcryptjs');
// Require the mongoose module 
const mongoose = require('mongoose');
let Schema = mongoose.Schema;
// Add the "dotenv" module
require('dotenv').config();
// Define a new "userSchema" 
let userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
        dateTime: Date,
        userAgent: String
    }
  ]
});
let User; // to be defined on new connection 

// Start Implement
// initialize()
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
      let db = mongoose.createConnection('mongodb+srv://Arin:gostan-kohkuf-rYbqu1@arincluster.noswejd.mongodb.net/SenecaDB', { useNewUrlParser: true, useUnifiedTopology: true });
      db.on('error', (err) => {
        reject(err); // reject the promise with the provided error
      });
      db.once('open', () => {
        User = db.model("users", userSchema);
        resolve();
      });
    });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
      if (userData.password !== userData.password2) {
          reject("Passwords do not match");
      } else {
          bcrypt.hash(userData.password, 10)
          .then(hash => {
              userData.password = hash;
              let newUser = new User(userData);
              return newUser.save();
          })
          .then(() => {
              resolve();
          })
          .catch(err => {
              if (err.code === 11000) {
                  reject("User Name already taken");
              } else {
                  reject("There was an error creating the user: " + err);
              }
          });
      }
  });
};


// checkUser(userData)
module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
      User.findOne({ userName: userData.userName })
        .exec()
        .then(user => {
          if (!user) {
            reject('Unable to find user: ' + userData.userName);
          } else {
            bcrypt.compare(userData.password, user.password).then(result => {
              if (result === true) {
                // Prepare login history update
                let update = { $set: {} };
                if (user.loginHistory.length === 8) {
                user.loginHistory.pop();
                }
                user.loginHistory.unshift({ dateTime: new Date().toString(), userAgent: userData.userAgent });
                update.$set.loginHistory = user.loginHistory;

                // Use updateOne to update the user
                User.updateOne({ userName: userData.userName }, update)
                .then(() => resolve(user))
                .catch(err => reject('There was an error updating the login history: ' + err));
            } else {
                reject('Incorrect Password for user: ' + userData.userName);
            }
            });
          }
        })
        .catch(err => reject('There was an error verifying the user: ' + err));
    });
  };