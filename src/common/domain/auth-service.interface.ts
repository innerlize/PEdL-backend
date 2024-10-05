export interface AuthService {
  verifyAdminAccess(token: string): Promise<boolean>;
  revokeToken(uid: string): Promise<void>;
}
