import { HttpError } from '@ts-types/api'
import { HTTP_STATUS, MOVIE_ERROR_MESSAGES } from '@ts/constants'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { genreMocks, movieMocks } from '../../../ts/mocks'
import prisma from '../../prisma'
import { createMovie, deleteMovie, getMovieList, getMovieWithGenres, updateMovie } from '../movies'

vi.mock('../../prisma', () => import('../mocks/prisma'))

const mockedPrisma = vi.mocked(prisma, { deep: true })

beforeEach(() => {
  mockReset(mockedPrisma)
})

describe('getMovieList', () => {
  it('resolves the movies owned by the logged user', async () => {
    mockedPrisma.movies.findMany.mockResolvedValue(movieMocks)

    const result = await getMovieList(movieMocks[0].userId)

    expect(mockedPrisma.movies.findMany).toHaveBeenCalledWith({
      where: { userId: movieMocks[0].userId }
    })
    expect(result).toEqual(movieMocks)
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.movies.findMany.mockRejectedValue(new Error('connection refused'))

    await expect(getMovieList(movieMocks[0].userId)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused')
    )
  })
})

describe('getMovieWithGenres', () => {
  it('resolves the movie with its genres mapped from the join table records, scoped to the logged user', async () => {
    const [movie] = movieMocks
    const [genre] = genreMocks
    const movieWithGenres = {
      ...movie,
      genres: [{ assignedAt: new Date(), genre, genreId: genre.id, movieId: movie.id }]
    }
    mockedPrisma.movies.findUnique.mockResolvedValue(movieWithGenres)

    const result = await getMovieWithGenres({ loggedUserId: movie.userId, movieId: movie.id })

    expect(mockedPrisma.movies.findUnique).toHaveBeenCalledWith({
      include: { genres: { include: { genre: true } } },
      where: { id: movie.id, userId: movie.userId }
    })
    expect(result).toEqual({ ...movie, genres: [genre] })
  })

  it('rejects with a 404 HttpError and never maps genres when the movie does not exist or is not owned by the logged user', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.movies.findUnique.mockResolvedValue(null)

    await expect(
      getMovieWithGenres({ loggedUserId: 'someone-else', movieId: 'missing-id' })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.NOT_FOUND, MOVIE_ERROR_MESSAGES.NOT_FOUND))
  })

  it('wraps any other rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedPrisma.movies.findUnique.mockRejectedValue(new Error('connection refused'))

    await expect(
      getMovieWithGenres({ loggedUserId: movieMocks[0].userId, movieId: movieMocks[0].id })
    ).rejects.toEqual(new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'connection refused'))
  })
})

describe('createMovie', () => {
  it('creates a movie for the logged user without leaking the loggedUserId into the stored data, wiring genres into a nested create', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    const genres = genreMocks[0].id
    mockedPrisma.movies.create.mockResolvedValue(movie)

    const result = await createMovie({ ...movieForm, genres, loggedUserId: userId })

    expect(mockedPrisma.movies.create).toHaveBeenCalledWith({
      data: { ...movieForm, genres: { create: [{ genreId: genres }] }, userId }
    })
    expect(result).toEqual(movie)
  })

  it('creates a movie with no genre links when genres is an empty string, instead of a bogus empty genreId', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    mockedPrisma.movies.create.mockResolvedValue(movie)

    await createMovie({ ...movieForm, genres: '', loggedUserId: userId })

    expect(mockedPrisma.movies.create).toHaveBeenCalledWith({
      data: { ...movieForm, genres: { create: [] }, userId }
    })
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userId, ...movieForm } = movieMocks[0]
    mockedPrisma.movies.create.mockRejectedValue(new Error('unique constraint failed'))

    await expect(createMovie({ ...movieForm, genres: '[]', loggedUserId: userId })).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'unique constraint failed')
    )
  })
})

describe('updateMovie', () => {
  it('deletes the movie previous genre links before recreating them, strips the id and loggedUserId out of data, scopes the where clause to the logged user, and returns the updated record', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    const { id, ...dataToUpdate } = movieForm
    const genres = genreMocks[0].id
    mockedPrisma.genresOnMovies.deleteMany.mockResolvedValue({ count: 1 })
    mockedPrisma.movies.update.mockResolvedValue(movie)
    mockedPrisma.$transaction.mockResolvedValue([{ count: 1 }, movie])

    const result = await updateMovie({ ...movieForm, genres, loggedUserId: userId })

    expect(mockedPrisma.genresOnMovies.deleteMany).toHaveBeenCalledWith({ where: { movieId: id } })
    expect(mockedPrisma.movies.update).toHaveBeenCalledWith({
      data: {
        ...dataToUpdate,
        genres: { create: [{ genreId: genres }] }
      },
      where: { id, userId }
    })
    expect(result).toEqual(movie)
  })

  it('updates a movie with no genre links when genres is an empty string, instead of a bogus empty genreId', async () => {
    const [movie] = movieMocks
    const { userId, ...movieForm } = movie
    const { id, ...dataToUpdate } = movieForm
    mockedPrisma.genresOnMovies.deleteMany.mockResolvedValue({ count: 1 })
    mockedPrisma.movies.update.mockResolvedValue(movie)
    mockedPrisma.$transaction.mockResolvedValue([{ count: 1 }, movie])

    await updateMovie({ ...movieForm, genres: '', loggedUserId: userId })

    expect(mockedPrisma.movies.update).toHaveBeenCalledWith({
      data: { ...dataToUpdate, genres: { create: [] } },
      where: { id, userId }
    })
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { userId, ...movieForm } = movieMocks[0]
    mockedPrisma.$transaction.mockRejectedValue(new Error('record not found'))

    await expect(updateMovie({ ...movieForm, genres: '', loggedUserId: userId })).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'record not found')
    )
  })
})

describe('deleteMovie', () => {
  it('deletes by id and always resolves true regardless of what mockedPrisma.movies.delete resolves', async () => {
    const [movie] = movieMocks
    mockedPrisma.movies.delete.mockResolvedValue(movie)

    const result = await deleteMovie(movie.id)

    expect(mockedPrisma.movies.delete).toHaveBeenCalledWith({ where: { id: movie.id } })
    expect(result).toBe(true)
  })

  it('wraps a rejection into a 500 HttpError carrying the original message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const [movie] = movieMocks
    mockedPrisma.movies.delete.mockRejectedValue(new Error('foreign key constraint failed'))

    await expect(deleteMovie(movie.id)).rejects.toEqual(
      new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'foreign key constraint failed')
    )
  })
})
