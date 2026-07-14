const API_ROUTE_BASE = '/api'

enum API_ENTITIES {
  MOVIE = 'movie'
}

export enum API_METHODS {
  POST = 'POST',
  PATCH = 'PATCH',
}

export enum API_URL {
  MOVIES = `${API_ROUTE_BASE}/${API_ENTITIES.MOVIE}`
}
