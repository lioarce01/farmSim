import { User } from './userTypes'; // Ajusta la ruta según tu estructura de carpetas

declare global {
  namespace Express {
    interface Request {
      user?: User; // La propiedad user es opcional
    }
  }
}
