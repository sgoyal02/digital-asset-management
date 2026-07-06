import express, { NextFunction, Request, Response } from "express";
import {globalRouter } from './router';
import { sendError } from "./response";
import cors from 'cors';
import { ApiError } from "./types/helper";

const app=express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

app.get("/health",(_,res) => {
  res.status(200).json({
    success: true,
    message: "api is healthy",
  });
});


app.use('/api', globalRouter);

app.use((req, res) => {
  sendError(res, "Route not found", 404);
});

//global err custom
app.use((err:unknown, req:Request, res:Response, next:NextFunction):void=>{
  const errFormat= err as Partial<ApiError>;
  const code = errFormat.statusCode|| 500;
    const msg = errFormat.message||'Internal server error';
    sendError(res, msg, code);
})

export default app;