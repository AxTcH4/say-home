import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const propertyRoutes = require('./routes/property.routes');
app.use('/api/properties', propertyRoutes);

export default app;