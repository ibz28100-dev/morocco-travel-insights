// Simple demo auth (frontend-only). Default: admin / admin123
const KEY = "ttap-auth-v1";

export type Session = { email: string; loggedAt: string } | null;

export function getSession(): Session {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function login(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === "admin" && password === "admin123") {
    const s = { email: "admin", loggedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
