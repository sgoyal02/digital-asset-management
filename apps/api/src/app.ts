import express, { Application, NextFunction, Request, Response } from "express";
import {globalRouter } from './router';
import { sendError } from "./response";
import cors from 'cors';

const app=express();

app.use(cors({
  origin: [
    'http://localhost:5173',
  ]
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`--${req.method}: ${req.path}`);
    next();
});

app.use('/api', globalRouter)

//global err custom
app.use((err:any, req:Request, res:Response, next:NextFunction):void=>{
    console.error("global catch: ", err.stack, err.message);
  const code = err.statusCode|| 500;
    const msg = err.message||'Internal server error';
    sendError(res, msg, code);
})

export default app;