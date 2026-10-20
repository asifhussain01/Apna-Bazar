import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: errorMessages
        });
        return;
      }
      next(error);
    }
  };
};
