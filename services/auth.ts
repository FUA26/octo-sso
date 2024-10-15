import { ApiClient } from ".";

interface ILogin {
  email: string;
  password: string;
  expiresInMins?: number; // optional
}

interface IUserInfoHeaders {
  Authorization: string;
  // you can add more headers here
}

interface IRefreshTokenHeaders {
  "Content-Type": string;
  Authorization: string;
}

interface IRefreshTokenBody {
  expiresInMins?: number;
}

export const login = (payload: ILogin) => {
  return ApiClient.post(`/api/auth/login`, payload, {});
};
export const getUserInfo = (headers: IUserInfoHeaders) => {
  return ApiClient.get(`/auth/me`, headers);
};

export const refreshToken = (
  payload: IRefreshTokenBody,
  headers: IRefreshTokenHeaders
) => {
  // console.log('refreshToken', payload, headers)
  return ApiClient.post(`/api/v1/auth/refresh`, payload, headers);
};
