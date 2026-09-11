import type { GenresModel, MoviesModel } from '@models'
import type { MovieFormModel, MovieWithGenresModel } from '@ts/types/entities'
import type { FormConfig, FormHookProps } from '@ts/types/forms'

import { actorFormTitle } from '@feature-components/actors/ReactActorsPage/configs'
import { movieFormInputs } from '@feature-components/movies/ReactMoviePage/configs'
import { useStore } from '@nanostores/react'
import { $globalLoading, setGlobalLoadingState } from '@store/loading'
import { callFormModal } from '@store/modals'
import {
  $contextSelectedMovie,
  addMovieToListContext,
  deleteMovieOnListContext,
  updateMovieOnListContext,
  updateSelectedMovieOnContext
} from '@store/movies'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import {
  parseModelToFormData,
  parseResponseErrorToMessage,
  parseResponseMessageToEntity
} from '@ts/parsers'
import { Form } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'

interface ReactMovieFormProps {
  genreList: GenresModel[]
}

export const useMovieForm = ({ genreList }: ReactMovieFormProps): FormHookProps<MoviesModel> => {
  const selectedMovieInContext = useStore($contextSelectedMovie)
  const isSystemLoading = useStore($globalLoading)
  const [movieForm] = Form.useForm<MoviesModel>()

  useEffect(() => {
    if (selectedMovieInContext) {
      movieForm.setFieldsValue(selectedMovieInContext)
    } else {
      movieForm.resetFields()
    }
  }, [selectedMovieInContext, movieForm])

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

  const handleInvalidation = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  const handleCancel = useCallback(() => {
    movieForm.resetFields()
    updateSelectedMovieOnContext(null)
  }, [movieForm])

  const handleMovieSubmit = async (_movieToSubmit: MovieFormModel) => {
    setGlobalLoadingState(true)

    const isInCreateMode = selectedMovieInContext === null
    const movieToSend: MovieFormModel = isInCreateMode
      ? _movieToSubmit
      : { ..._movieToSubmit, id: selectedMovieInContext.id }
    const movieFormData = parseModelToFormData(movieToSend)

    if (selectedMovieInContext === null) {
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
        publishNotification({ content: 'Movie created', type: 'success' })
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
          id: selectedMovieInContext.id,
          name,
          releaseYear,
          userId: selectedMovieInContext.userId
        })

        publishNotification({
          content: `Movie '${_movieToSubmit.name}' updated`,
          type: 'success'
        })
      }
    }

    setGlobalLoadingState(false)
  }

  const handleMovieUpdate = async (_movieToEdit: MoviesModel) => {
    setGlobalLoadingState(true)

    const movieCompleteResponse = await fetchWithAuth(`${API_URLS.MOVIES}/${_movieToEdit.id}`, {
      method: API_METHODS.GET
    })

    if (movieCompleteResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(movieCompleteResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      const movieCompleteModel =
        await parseResponseMessageToEntity<MovieWithGenresModel>(movieCompleteResponse)

      updateSelectedMovieOnContext(movieCompleteModel)
      invokeMovieForm()
    }

    setGlobalLoadingState(false)
  }

  const handleMovieDelete = async (_movieToDelete: MoviesModel) => {
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
      publishNotification({ content: 'Movie deleted', type: 'success' })
    }

    setGlobalLoadingState(false)
  }

  const invokeMovieForm = () => {
    callFormModal({
      form: {
        formInputs: memoizedFormInputs,
        formInstance: movieForm,
        formTitle: actorFormTitle,
        isLoading: isSystemLoading,
        onSubmit: handleMovieSubmit,
        onSubmitFailed: handleInvalidation
      }
    })
  }

  return {
    handleCreate: invokeMovieForm,
    handleDelete: handleMovieDelete,
    handleUpdate: handleMovieUpdate
  }
}
