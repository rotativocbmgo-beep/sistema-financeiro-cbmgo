// Este arquivo estava faltando, causando o erro de importação.
export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-for-dev',
    expiresIn: '1d',
  },
};
