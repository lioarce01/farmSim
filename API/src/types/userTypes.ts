export interface User {
  id: string;          // ID del usuario
  username: string;   // Nombre de usuario
  inventory?: any;    // Puedes definir el tipo del inventario si es necesario
  balanceToken: number; // Balance de tokens
}