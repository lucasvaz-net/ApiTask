const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./user');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'medium'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachments: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { as: 'User', foreignKey: 'userId' });
Task.belongsTo(User, { as: 'Assignee', foreignKey: 'assignedTo' });

module.exports = Task;
