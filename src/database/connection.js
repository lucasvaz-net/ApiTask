const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/database/task.sqlite' 
});

module.exports = sequelize;
