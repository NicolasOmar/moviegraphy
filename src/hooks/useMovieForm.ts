import type { GenresModel, MoviesModel } from '@models'
import type { MovieFormModel, MovieWithGenresModel } from '@ts/types/entities'
import type { FormConfig, FormHookProps } from '@ts/types/forms'

import { actorFormTitle } from '@feature-components/actors/ReactActorsPage/configs'
import { movieFormInputs } from '@feature-components/movies/ReactMoviePage/configs'
import { useStore } from '@nanostores/react'
import { $globalLoading, setGlobalLoadingState } from '@store/loading'
import { callFormModal, callViewModal } from '@store/modals'
import {
  $contextSelectedMovie,
  addMovieToListContext,
  deleteMovieOnListContext,
  updateMovieOnListContext,
  updateSelectedMovieOnContext
} from '@store/movies'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS, MOVIE_SUCCESS_MESSAGES } from '@ts/constants'
import { fetchWithAuth, publishFormError } from '@ts/helpers'
import {
  parseModelToFormData,
  parseResponseErrorToMessage,
  parseResponseMessageToEntity
} from '@ts/parsers'
import { Form } from 'antd'
import { useCallback, useMemo, useState } from 'react'

interface ReactMovieFormProps {
  genreList: GenresModel[]
}

export const useMovieForm = ({ genreList }: ReactMovieFormProps): FormHookProps<MoviesModel> => {
  const isSystemLoading = useStore($globalLoading)
  const [movieForm] = Form.useForm<MovieFormModel>()
  const [searchValue, setSearchValue] = useState<null | string>(null)

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      movieForm.setFieldsValue({
        ..._movie,
        genres: _movie.genres?.map(({ id }) => id) ?? []
      })
    } else {
      movieForm.resetFields()
    }
  })

  const memoizedFormInputs = useMemo(() => {
    return [
      ...movieFormInputs,
      {
        config: {
          initialValue: [],
          label: 'Genres',
          name: 'genres',
          options: genreList.map(_genre => ({ label: _genre.name, value: _genre.id }))
        },
        type: 'select'
      }
    ] as FormConfig<MovieFormModel>
  }, [genreList])

  const handleCancel = useCallback(() => {
    movieForm.resetFields()
    updateSelectedMovieOnContext(null)
  }, [movieForm])

  const handleMovieSubmit = async (_movieToSubmit: MovieFormModel) => {
    setGlobalLoadingState(true)

    const movieInContext = $contextSelectedMovie.get()
    const isInCreateMode = movieInContext == null
    const movieToSend: MovieFormModel = isInCreateMode
      ? _movieToSubmit
      : { ..._movieToSubmit, id: movieInContext.id }
    const movieFormData = parseModelToFormData(movieToSend)

    if (isInCreateMode) {
      const movieCreateResponse = await fetchWithAuth(API_URLS.MOVIES, {
        body: movieFormData,
        method: API_METHODS.POST
      })

      if (movieCreateResponse.status !== HTTP_STATUS.OK) {
        const errorMessage = await parseResponseErrorToMessage(movieCreateResponse)
        publishNotification({ content: errorMessage, type: 'error' })
      } else {
        const newMovieFinal = await parseResponseMessageToEntity<MoviesModel>(movieCreateResponse)

        handleCancel()
        addMovieToListContext(newMovieFinal)
        publishNotification({ content: MOVIE_SUCCESS_MESSAGES.CREATE, type: 'success' })
      }
    } else {
      const movieUpdateResponse = await fetchWithAuth(API_URLS.MOVIES, {
        body: movieFormData,
        method: API_METHODS.PATCH
      })

      if (movieUpdateResponse.status !== HTTP_STATUS.OK) {
        const errorMessage = await parseResponseErrorToMessage(movieUpdateResponse)
        publishNotification({ content: errorMessage, type: 'error' })
      } else {
        const { countryMade, description, name, releaseYear } = _movieToSubmit

        handleCancel()
        updateMovieOnListContext({
          countryMade,
          description,
          id: movieInContext.id,
          name,
          releaseYear,
          userId: movieInContext.userId
        })

        publishNotification({
          content: `Movie '${_movieToSubmit.name}' updated`,
          type: 'success'
        })
      }
    }

    setGlobalLoadingState(false)
  }

  const handleUpdate = async (_movieToEdit: MoviesModel) => {
    setGlobalLoadingState(true)

    const movieToUpdateResponse = await fetchWithAuth(`${API_URLS.MOVIES}/${_movieToEdit.id}`, {
      method: API_METHODS.GET
    })

    if (movieToUpdateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(movieToUpdateResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      const movieToUpdate =
        await parseResponseMessageToEntity<MovieWithGenresModel>(movieToUpdateResponse)

      updateSelectedMovieOnContext(movieToUpdate)
      invokeForm()
    }

    setGlobalLoadingState(false)
  }

  const handleDelete = async (_movieToDelete: MoviesModel) => {
    setGlobalLoadingState(true)
    const movieIdToDelete = parseModelToFormData({ id: _movieToDelete.id })

    const movieDeleteResponse = await fetchWithAuth(API_URLS.MOVIES, {
      body: movieIdToDelete,
      method: API_METHODS.DELETE
    })

    if (movieDeleteResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(movieDeleteResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      deleteMovieOnListContext(_movieToDelete.id)
      updateSelectedMovieOnContext(null)
      publishNotification({ content: MOVIE_SUCCESS_MESSAGES.DELETE, type: 'success' })
    }

    setGlobalLoadingState(false)
  }

  const invokeForm = () => {
    callFormModal({
      form: {
        formInputs: memoizedFormInputs,
        formInstance: movieForm,
        formTitle: actorFormTitle,
        isLoading: isSystemLoading,
        onSubmit: handleMovieSubmit,
        onSubmitFailed: publishFormError
      }
    })
  }

  const handleSearch = (searchValue: string) =>
    setSearchValue(searchValue.length ? searchValue : null)

  const handleView = (_movieToView: MoviesModel) => {
    callViewModal({ content: _movieToView })
  }

  return {
    handleCreate: invokeForm,
    handleDelete,
    handleSearch,
    handleUpdate,
    handleView,
    isLoading: isSystemLoading,
    searchTerm: searchValue
  }
}
