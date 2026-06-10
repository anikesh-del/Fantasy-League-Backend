require('express-async-errors');
const express=require("express");
const app=express();

const authRouter=require('./routes/auth.routes');
const fantasyRouter=require('./routes/fantasy.routes');
const syncRouter = require('./routes/sync.routes');
const settlementRouter = require('./routes/settlement.routes');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
// const statsRouter=require('./routes/stats.routes');

const errorHandler=require('./middlewares/error.middleware');

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/fantasy',rateLimiter(),fantasyRouter);
app.use('/api/v1/admin/sync',syncRouter);
app.use('/api/v1/admin/settle', settlementRouter );
// app.use('/api/v1/stats',statsRouter);

app.use(errorHandler);

module.exports=app;