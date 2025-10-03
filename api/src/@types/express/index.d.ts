// Exemplo de extensão mínima (opcional)
import "express-serve-static-core";
declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}
