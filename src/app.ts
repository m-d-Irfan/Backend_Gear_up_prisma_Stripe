import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

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

// Global Error Handler & 404 Route Catchers
app.use(globalErrorHandler);
app.use(notFound);

export default app;

