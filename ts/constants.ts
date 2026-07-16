const API_ROUTE_BASE = '/api'

export enum API_METHODS {
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  POST = 'POST'
}

enum API_ENTITIES {
  MOVIE = 'movie'
}

export enum API_URL {
  MOVIES = `${API_ROUTE_BASE}/${API_ENTITIES.MOVIE}`
}
