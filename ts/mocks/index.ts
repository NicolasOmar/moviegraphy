import type { MoviesModel, SessionsModel, UsersModel } from '@models'

import moviesFixture from './movies.mocks.json'
import sessionsFixture from './sessions.mocks.json'
import usersFixture from './users.mocks.json'

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
