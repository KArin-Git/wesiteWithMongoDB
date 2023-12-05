// Include the dotenv module at the top
require('dotenv').config();

// Include the sequelize module
const Sequelize = require('sequelize');

// Create the sequelize object with database configuration from environment variables
let sequelize = new Sequelize(
  process.env.DB_DATABASE, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

// Define the Theme model
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING
}, {
  timestamps: false // Disable the createdAt and updatedAt fields
});

// Define the Set model
const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Theme,
      key: 'id'
    }
  },
  img_url: Sequelize.STRING
}, {
  timestamps: false // Disable the createdAt and updatedAt fields
});

// Create an association between Set and Theme
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        resolve(); // Resolve the promise if sync is successful
      })
      .catch((error) => {
        reject(error); // Reject the promise with the error if sync fails
      });
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme]
    })
    .then(sets => {
      resolve(sets); // Resolve the promise with the retrieved sets
    })
    .catch(error => {
      reject(error); // Reject the promise with the error if the operation fails
    });
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      where: { set_num: setNum },
      include: [Theme]
    })
    .then(sets => {
      if (sets && sets.length > 0) {
        resolve(sets[0]); // Resolve with the first set if found
      } else {
        reject("Unable to find requested set"); // Reject if no set is found
      }
    })
    .catch(error => {
      reject(error); // Reject with the error if the operation fails
    });
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [{
        model: Theme,
        where: {
          name: {
            [Sequelize.Op.iLike]: `%${theme}%`
          }
        }
      }]
    })
    .then(sets => {
      if (sets.length > 0) {
        resolve(sets); // Resolve with the found sets
      } else {
        reject("Unable to find requested sets"); // Reject if no sets are found
      }
    })
    .catch(error => {
      reject(error); // Reject with the error if the operation fails
    });
  });
}

// Function to add a new LEGO set
function addSet(setData) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a new Set using the Set model
      const newSet = await Set.create(setData);
      resolve();
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        reject(err.errors[0].message);
      } else {
        reject('An error occurred while adding the set.');
      }
    }
  });
}

// Function to edit a set
async function editSet(set_num, setData) {
  try {
    // Use the Set model to update the existing set with the provided set_num
    const updatedSet = await Set.update(setData, {
      where: { set_num: set_num },
    });

    // Check if any sets were updated
    if (updatedSet[0] === 0) {
      // If no sets were updated, it means there was no matching set
      throw new Error(`Set with set_num ${set_num} not found.`);
    }

    // Resolve the Promise once the set has been successfully updated
    return Promise.resolve();
  } catch (err) {
    // Reject the Promise with an error message if there was an error
    return Promise.reject(err.errors[0].message || 'Error updating the set.');
  }
}

// Function to delete a set by set_num
function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      // Use the Set model to find the set with the provided set_num and delete it
      const deletedSet = await Set.destroy({
        where: { set_num: set_num },
      });

      // Check if any sets were deleted
      if (deletedSet === 0) {
        // If no sets were deleted, it means there was no matching set
        throw new Error(`Set with set_num ${set_num} not found.`);
      }

      // Resolve the Promise once the set has been successfully deleted
      resolve();
    } catch (err) {
      // Reject the Promise with an error message if there was an error
      reject(err.errors[0].message || 'Error deleting the set.');
    }
  });
}

// Function to get all themes
function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    try {
      // Find all themes using the Theme model
      const themes = await Theme.findAll();
      resolve(themes);
    } catch (err) {
      reject(err);
    }
  });
}

// Export the models and sequelize instance if needed
module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  editSet,
  deleteSet,
  getAllThemes,
  Theme,
  Set,
  sequelize
};