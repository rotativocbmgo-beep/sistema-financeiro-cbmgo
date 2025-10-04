import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Garante que a pasta 'uploads' exista. No Render, isso será um diretório no disco efêmero.
const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

export default {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(request, file, callback) {
      // Gera um hash único para o nome do arquivo para evitar conflitos
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;
      callback(null, fileName);
    },
  }),
};
