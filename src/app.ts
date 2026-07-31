import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

// Parsers & Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root / Health check route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to GearUp API - Sports & Outdoor Gear Rental Service 🏋️',
    status: 'Server is healthy and running smoothly',
  });
});

export default app;
