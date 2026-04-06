import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { z } from "zod";

const  errorHandler:ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      
      success:false,
      message: 'Invalid inputs', 
      errors: err.stack }
    )
  }

  res.status(500).json({       
      success:false,
      message: 'An internal error has occured', 
      errors: err.stack }
    ) 
      
}
export default errorHandler;