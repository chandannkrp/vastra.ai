export type Role = "admin" | "seller";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: Role;
  user: User;
}
