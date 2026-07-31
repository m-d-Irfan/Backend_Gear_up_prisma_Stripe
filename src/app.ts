import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import { swaggerSpec } from './app/config/swagger';

const app: Application = express();

// Parsers & Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Interactive API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Central API Routes
app.use('/api/v1', router);

// Root / Health check route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to GearUp API - Sports & Outdoor Gear Rental Service 🏋️',
    docs: 'Interactive Swagger UI Documentation available at /api-docs',
    status: 'Server is healthy and running smoothly',
  });
});

// Health endpoint for UptimeRobot / Cron monitoring
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Global Error Handler & 404 Route Catchers
app.use(globalErrorHandler);
app.use(notFound);

export default app;
