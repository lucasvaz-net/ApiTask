const express = require('express');
const sequelize = require('./database/connection');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerSchemas');
const requestIp = require('request-ip'); 
require('dotenv').config();

const app = express();

app.use(helmet());

app.use(requestIp.mw()); 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições vindas deste IP, por favor tente novamente após 15 minutos.',
  keyGenerator: (req) => {
    return req.clientIp; 
  },
});

app.use(limiter);
app.use(express.json());

sequelize.sync()
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((error) => {
    console.error('Error synchronizing the database:', error);
  });

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
