import express, { Application, Request, Response } from "express"
import  errorHandler  from './middleware/error.middleware.js'
import router, * as routes from './routes/web.js'

//construct app and port 
const app: Application = express();

// enable url data parsing
app.use(express.urlencoded({extended: true}));

// Middleware
app.use(express.json());

//routes
app.use('/', router)


app.use(errorHandler);

export default app;