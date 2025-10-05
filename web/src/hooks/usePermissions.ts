// web/src/hooks/usePermissions.ts

import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  permissions: string[];
}

export function usePermissions() {
  const { token } = useAuth();

  if (!token) {
    return {
      hasPermission: () => false,
      userPermissions: []
    };
  }

  try {
    const decoded: TokenPayload = jwtDecode(token);
    const userPermissions = decoded.permissions || [];

    const hasPermission = (requiredPermissions: string | string[]): boolean => {
      const permissionsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      if (permissionsArray.length === 0) {
        return true; // Se nenhuma permissão é necessária, o acesso é permitido
      }
      return permissionsArray.some(p => userPermissions.includes(p));
    };

    return { hasPermission, userPermissions };

  } catch (error) {
    console.error("Erro ao decodificar o token JWT:", error);
    return {
      hasPermission: () => false,
      userPermissions: []
    };
  }
}
