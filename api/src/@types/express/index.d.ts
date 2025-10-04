// Este arquivo estende a definição de tipos do Express para todo o projeto.

declare namespace Express {
  export interface Request {
    // Adiciona a propriedade 'user' que já usamos no middleware de autenticação
    user: {
      id: string;
    };
    
    // Adiciona a propriedade 'file' que o Multer usa para o upload de arquivos únicos.
    // O tipo 'Express.Multer.File' virá do pacote @types/multer.
    file: Multer.File;
  }
}
