export interface IUser {
  name: string;
  email: string;
  password?: string; // Senha é opcional em alguns contextos (ex: resposta da API)
}
