import express, { Application, Request, Response } from "express"

//construct app and port 
const app: Application = express();

// enable url data parsing
app.use(express.urlencoded({extended: true}));

// Middleware
app.use(express.json());

export default app;