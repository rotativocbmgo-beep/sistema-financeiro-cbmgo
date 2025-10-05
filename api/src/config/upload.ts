// api/src/config/upload.ts

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../errors/AppError';

// Define o diretório de uploads. Usamos path.resolve para garantir que o caminho seja absoluto.
// Ele sairá de 'src/config', voltará para 'src', depois para 'api' e entrará em 'uploads'.
const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

export default {
  directory: uploadFolder,

  // Define como os arquivos serão armazenados no disco.
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(request, file, callback) {
      // Gera um hash aleatório de 10 bytes e o converte para hexadecimal.
      const fileHash = crypto.randomBytes(10).toString('hex');
      
      // Para evitar problemas com nomes de arquivo, removemos espaços e caracteres especiais.
      const sanitizedOriginalName = file.originalname.replace(/\s+/g, '_');
      
      // O nome final do arquivo será o hash + nome original sanitizado para garantir unicidade.
      const fileName = `${fileHash}-${sanitizedOriginalName}`;

      callback(null, fileName);
    },
  }),

  // Define limites para os arquivos enviados.
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },

  // Filtra os arquivos para aceitar apenas os tipos permitidos.
  fileFilter: (request: any, file: any, callback: any) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg', // Variação para JPEG
      'image/png',
      'application/pdf',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true); // Aceita o arquivo
    } else {
      // Rejeita o arquivo com um erro padronizado
      callback(new AppError('Tipo de arquivo inválido. Apenas JPG, PNG e PDF são permitidos.', 400));
    }
  },
};
