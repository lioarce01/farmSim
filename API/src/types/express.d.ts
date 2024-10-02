import { User } from './userTypes';

declare global {
  namespace Express {
    interface Request {
      user?: User; 
    }
  }
}
