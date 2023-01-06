import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const sendResponse = (error: Error, status: number) => {
    return res.status(status).json({ message: error.message });
  };

  switch (error.message) {
    case "apiOfferNotFound":
      return sendResponse(error, 404);
    case "apiConversationNotFound":
      return sendResponse(error, 404);
    default:
      return sendResponse(Error("apiUnknownError"), 500);
  }
};

export default errorHandler;
