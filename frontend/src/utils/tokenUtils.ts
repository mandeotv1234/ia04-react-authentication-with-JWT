import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  sub: string;
  email: string;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function getTokenExpiryTime(token: string): number | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000;
  } catch (error) {
    return null;
  }
}

export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return timeUntilExpiry < 120;
  } catch (error) {
    return true;
  }
}