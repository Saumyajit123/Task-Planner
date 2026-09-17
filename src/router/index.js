const express = require("express");
const app = express.Router();

// API routes:

const userRoutes = require("./apis/userRoutes");
app.use('/api', userRoutes);

const taskRoutes = require("./apis/taskRoutes");
app.use('/api', taskRoutes);

const categoryRoutes = require("./apis/categoryRoutes");
app.use('/api', categoryRoutes);

const labelRoutes = require("./apis/labelRoutes");
app.use('/api', labelRoutes);

const reminderRoutes = require("./apis/reminderRoutes");
app.use('/api', reminderRoutes);

const reportRoutes = require("./apis/reportRoutes");
app.use('/api', reportRoutes);


// EJS routes:

const userEjsRoutes = require("../router/ejs/userEJSRouter");
app.use('/ui', userEjsRoutes);

const taskEjsRoutes = require("../router/ejs/taskEJSRouter")
app.use('/ui', taskEjsRoutes);

const categoryEjsRoutes = require("../router/ejs/categoryEJSRouter");
app.use('/ui', categoryEjsRoutes);

const labelEjsRoutes = require("../router/ejs/labelEJSRouter");
app.use('/ui', labelEjsRoutes);

const reminderEjsRouter = require("../router/ejs/reminderEJSRouter");
app.use('/ui', reminderEjsRouter);

const reportEjsRouter = require("../router/ejs/reportEJSRouter");
app.use('/ui', reportEjsRouter);


module.exports = app;