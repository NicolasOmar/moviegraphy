import type { GenresModel, MoviesModel, SessionsModel, UsersModel } from '@models'

import genresFixture from './genres.mocks.json'
import moviesFixture from './movies.mocks.json'
import sessionsFixture from './sessions.mocks.json'
import usersFixture from './users.mocks.json'

export const genreMocks: GenresModel[] = genresFixture

export const movieMocks: MoviesModel[] = moviesFixture

export const userMocks: UsersModel[] = usersFixture

type SessionFixture = Omit<SessionsModel, 'createdAt' | 'expiresAt'> & {
  createdAt: string
  expiresAt: string
}

export const sessionMocks: SessionsModel[] = (sessionsFixture as SessionFixture[]).map(session => ({
  ...session,
  createdAt: new Date(session.createdAt),
  expiresAt: new Date(session.expiresAt)
}))
