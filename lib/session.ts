export type UserRole = "buyer" | "womanpreneur" | "admin";

export type Session = {
  userId: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  storeId?: string;
  storeSlug?: string;
  storeName?: string;
} | null;
