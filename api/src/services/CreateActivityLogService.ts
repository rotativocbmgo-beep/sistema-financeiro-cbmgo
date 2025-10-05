// api/src/services/CreateActivityLogService.ts

import { prisma } from "../server";

interface ILogRequest {
  userId: string;
  action: string;
  details?: object;
  ipAddress?: string;
}

export class CreateActivityLogService {
  async execute({ userId, action, details, ipAddress }: ILogRequest) {
    // O comando `npx prisma generate` corrige o erro que aparecia nesta linha
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details || {},
        ipAddress: ipAddress || 'N/A',
      },
    });
  }
}
