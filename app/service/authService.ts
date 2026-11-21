import { redirect } from "next/dist/server/api-utils";

export type User = {
  token: string;
  tokenType: string;
  email: string;
  name: string;
  role: string;
};

export async function getAuthUser() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  localStorage.removeItem("auth");
}
