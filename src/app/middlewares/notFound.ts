import { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: 'API Endpoint Not Found',
    errorDetails: {
      path: req.originalUrl,
      method: req.method,
      details: 'The requested API route does not exist on this server.',
    },
  });
};

export default notFound;
