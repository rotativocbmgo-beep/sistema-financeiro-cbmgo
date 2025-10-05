// api/src/errors/AppError.ts

export class AppError {
  public readonly message: string;
  public readonly statusCode: number;
  // 1. Adicionar a propriedade pública para os detalhes
  public readonly details?: any;

  // 2. Adicionar o terceiro parâmetro opcional ao construtor
  constructor(message: string, statusCode = 400, details?: any) {
    this.message = message;
    this.statusCode = statusCode;
    // 3. Atribuir os detalhes à propriedade da classe
    this.details = details;
  }
}
