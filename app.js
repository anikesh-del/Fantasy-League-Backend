require('express-async-errors');
const express=require("express");
const app=express();

const authRouter=require('./routes/auth.routes');
const fantasyRouter=require('./routes/fantasy.routes');
const statsRouter=require('./routes/stats.routes');

const errorHandler=require('./middlewares/error.middleware');

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/fantasy',fantasyRouter);
app.use('/api/v1/stats',statsRouter);

app.use(errorHandler);

module.exports=app;