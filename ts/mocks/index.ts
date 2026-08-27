import type {
  ActorsModel,
  CountriesModel,
  GendersModel,
  GenresModel,
  MoviesModel,
  SessionsModel,
  UsersModel
} from '@models'

import actorsFixture from './actors.mocks.json'
import countriesFixture from './countries.mocks.json'
import gendersFixture from './genders.mocks.json'
import genresFixture from './genres.mocks.json'
import moviesFixture from './movies.mocks.json'
import sessionsFixture from './sessions.mocks.json'
import usersFixture from './users.mocks.json'

export const genreMocks: GenresModel[] = genresFixture

export const movieMocks: MoviesModel[] = moviesFixture

export const userMocks: UsersModel[] = usersFixture

export const countryMocks: CountriesModel[] = countriesFixture

export const genderMocks: GendersModel[] = gendersFixture

type SessionFixture = Omit<SessionsModel, 'createdAt' | 'expiresAt'> & {
  createdAt: string
  expiresAt: string
}

export const sessionMocks: SessionsModel[] = (sessionsFixture as SessionFixture[]).map(session => ({
  ...session,
  createdAt: new Date(session.createdAt),
  expiresAt: new Date(session.expiresAt)
}))

type ActorFixture = Omit<ActorsModel, 'bornDate' | 'deadDate'> & {
  bornDate: string
  deadDate: null | string
}

export const actorMocks: ActorsModel[] = (actorsFixture as ActorFixture[]).map(actor => ({
  ...actor,
  bornDate: new Date(actor.bornDate),
  deadDate: actor.deadDate ? new Date(actor.deadDate) : null
}))
