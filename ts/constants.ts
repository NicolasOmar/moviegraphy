const API_ROUTE_BASE = '/api'

export enum API_METHODS {
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  POST = 'POST'
}

enum API_ENTITIES {
  MOVIE = 'movie',
  USERS = 'users'
}

export enum API_URL {
  MOVIES = `${API_ROUTE_BASE}/${API_ENTITIES.MOVIE}`,
  USERS = `${API_ROUTE_BASE}/${API_ENTITIES.USERS}`
}

export enum HTTP_STATUS {
  OK = 200,
  BAD_REQUEST = 400,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

export enum USER_ERROR_MESSAGES {
  DUPLICATE_EMAIL = 'A user with this email already exists',
  MISSING_FIELDS = 'Name, email and password are required',
  PASSWORD_MISMATCH = 'Password and repeat password do not match',
  UNEXPECTED = 'Something went wrong while creating the user'
}
