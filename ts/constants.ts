const API_ROUTE_BASE = '/api'

export enum API_METHODS {
  DELETE = 'DELETE',
  GET = 'GET',
  PATCH = 'PATCH',
  POST = 'POST'
}

enum API_ENTITIES {
  ACTORS = 'actors',
  GENRES = 'genres',
  MOVIE = 'movies',
  PASSWORDS = 'passwords',
  SESSIONS = 'sessions',
  USERS = 'users'
}

export enum API_URLS {
  ACTORS = `${API_ROUTE_BASE}/${API_ENTITIES.ACTORS}`,
  GENRES = `${API_ROUTE_BASE}/${API_ENTITIES.GENRES}`,
  MOVIES = `${API_ROUTE_BASE}/${API_ENTITIES.MOVIE}`,
  PASSWORDS = `${API_ROUTE_BASE}/${API_ENTITIES.PASSWORDS}`,
  SESSIONS = `${API_ROUTE_BASE}/${API_ENTITIES.SESSIONS}`,
  USERS = `${API_ROUTE_BASE}/${API_ENTITIES.USERS}`
}

export enum HTTP_STATUS {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}

export enum MOVIE_ERROR_MESSAGES {
  NOT_FOUND = 'Movie not found'
}

/** Builds the confirmation message shown before deleting a genre that still has movies linked to it
 *
 * @param _genreName - Name of the genre about to be deleted
 * @param _moviesAmount - Amount of movies currently linked to that genre
 * @returns The confirmation message to display on the deletion modal
 */
export const buildGenreDeleteConfirmationMessage = (
  _genreName: string,
  _moviesAmount: number
): string =>
  `The genre '${_genreName}' has ${_moviesAmount} movies registered, are you sure you want to delete the genre anyways?`

export enum PAGE_URL {
  ACTORS = '/actors',
  GENRES = '/genres',
  HOME = '/',
  LOGIN = '/login',
  MOVIES = '/movies',
  USERS_CREATE = '/users/create',
  USERS_UPDATE = '/users/update'
}

export enum USER_ERROR_MESSAGES {
  DUPLICATE_EMAIL = 'A user with this email already exists',
  INVALID_CREDENTIALS = 'Username or password is incorrect',
  MISSING_FIELDS = 'Username, email and password are required',
  PASSWORD_MISMATCH = 'Both passwords do not match',
  SESSION_EXPIRED = 'Session expired, please log in again',
  UNEXPECTED = 'Something went wrong while creating the user'
}

export const SESSION_COOKIE_NAME = 'session'

export enum ACTOR_LABELS {
  NEW_BTN = '+ New Actor',
  NO_DATA = 'There are not registered Actors',
  NO_SEARCH_DATA = 'There are no registered actors based on your search',
  TITLE = 'List of Actors'
}

export enum COMMON_ERROR_MESSAGES {
  FORM_ERRORS = 'Check the form messages'
}

export enum COMMON_LABELS {
  CANCEL = 'Cancel',
  CONFIRM = 'Confirm',
  DELETE = 'Delete',
  EDIT = 'Edit',
  NEW_BTN = 'Create a new one',
  OPTIONS = 'Options',
  SEARCH_BY_NAME = 'Search by name',
  VIEW = 'VIEW'
}

export enum GENRE_LABELS {
  NEW_BTN = '+ New Genre',
  NO_DATA = 'There are not registered Genres',
  NO_SEARCH_DATA = 'There are no registered genres based on your search',
  TITLE = 'List of Genres'
}

export enum GENRE_SUCCESS_MESSAGES {
  CREATE = 'Genre created',
  DELETE = 'Genre deleted'
}

export enum MOVIE_LABELS {
  NEW_BTN = '+ New Movie',
  NO_DATA = 'There are not registered Movies',
  NO_SEARCH_DATA = 'There are no registered movies based on your search',
  TITLE = 'List of Movies'
}

export enum MOVIE_SUCCESS_MESSAGES {
  CREATE = 'Movie created',
  DELETE = 'Movie deleted'
}
