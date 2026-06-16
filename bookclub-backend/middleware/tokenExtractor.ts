import { type Request, type Response, type NextFunction } from "express";

const tokenExtractor = (req: Request, _res: Response, next: NextFunction) => {
  req.token = undefined;
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "");
  } else {
    req.token = undefined;
  }
  next();
};

export default tokenExtractor;
