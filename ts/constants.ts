const API_ROUTE_BASE = '/api'

export enum API_METHODS {
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  POST = 'POST'
}

enum API_ENTITIES {
  MOVIE = 'movies',
  PASSWORDS = 'passwords',
  SESSIONS = 'sessions',
  USERS = 'users'
}

export enum API_URL {
  MOVIES = `${API_ROUTE_BASE}/${API_ENTITIES.MOVIE}`,
  PASSWORDS = `${API_ROUTE_BASE}/${API_ENTITIES.PASSWORDS}`,
  SESSIONS = `${API_ROUTE_BASE}/${API_ENTITIES.SESSIONS}`,
  USERS = `${API_ROUTE_BASE}/${API_ENTITIES.USERS}`
}

export enum HTTP_STATUS {
  OK = 200,
  BAD_REQUEST = 400,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

export enum PAGE_URL {
  HOME = '/',
  LOGIN = '/login',
  MOVIES = '/movies',
  USERS = '/users',
  USERS_CREATE = '/users/create',
  USERS_UPDATE = '/users/update'
}

export enum USER_ERROR_MESSAGES {
  DUPLICATE_EMAIL = 'A user with this email already exists',
  INVALID_CREDENTIALS = 'Name or password is incorrect',
  MISSING_FIELDS = 'Name, email and password are required',
  PASSWORD_MISMATCH = 'Both passwords do not match',
  UNEXPECTED = 'Something went wrong while creating the user'
}

export const SESSION_COOKIE_NAME = 'session'
