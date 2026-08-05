import { Request, Response, NextFunction } from "express";

export default function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const started = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - started;

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}