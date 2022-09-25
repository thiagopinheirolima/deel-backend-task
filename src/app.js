const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const contracts = require('./routes/contracts');
const jobs = require('./routes/jobs');
const balances = require('./routes/balances');
const admin = require('./routes/admin');
const { getProfile } = require('./middleware/getProfile');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

// Routes
app.use('/contracts', getProfile, contracts);
app.use('/jobs', getProfile, jobs);
app.use('/balances', balances);
app.use('/admin', admin);

module.exports = app;
