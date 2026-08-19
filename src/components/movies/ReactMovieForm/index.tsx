import type { GenresModel, MoviesModel } from '@models'
import type { MovieFormModel } from '@ts/entities'
import type { FormConfig } from '@ts/types'

import { type FormButton, ReactForm } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import {
  $contextSelectedMovie,
  addMovieToListContext,
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
import { type FC, useCallback, useMemo } from 'react'

import { movieFormInputs, movieFormTitle } from './configs'

interface ReactMovieFormProps {
  genreList: GenresModel[]
}

export const ReactMovieForm: FC<ReactMovieFormProps> = ({ genreList }) => {
  const selectedMovieInContext = useStore($contextSelectedMovie)
  const isSystemLoading = useStore($contextLoading)
  const [movieForm] = Form.useForm<MovieFormModel>()

  const handleCancel = useCallback(() => {
    movieForm.resetFields()
    updateSelectedMovieOnContext(null)
  }, [movieForm])

  const memoizedFormInputs = useMemo(() => {
    return [
      ...movieFormInputs,
      {
        config: {
          label: 'Genres',
          name: 'genres',
          options: genreList.map(_genre => ({ label: _genre.name, value: _genre.id })),
          values: []
        },
        type: 'select'
      }
    ] as FormConfig<MovieFormModel>
  }, [genreList])
  const memoizedFormButtons = useMemo(() => {
    const submitButtonText = selectedMovieInContext ? 'Update' : 'Create'
    const submitButton: FormButton = {
      htmlType: 'submit',
      title: submitButtonText,
      type: 'primary'
    }
    const buttons: FormButton[] = selectedMovieInContext
      ? [
          submitButton,
          {
            htmlType: 'button',
            onClick: () => handleCancel(),
            title: 'Cancel',
            type: 'text'
          }
        ]
      : [submitButton]

    return buttons
  }, [selectedMovieInContext, handleCancel])

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      movieForm.setFieldsValue({
        ..._movie,
        genres: _movie.genres?.map(({ id }) => id) ?? []
      })
    }
  })

  const handleSubmit = async (_movieToSubmit: MovieFormModel) => {
    setLoadingSystemState(true)

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
        handleCancel()
        updateMovieOnListContext({
          ...selectedMovieInContext,
          ..._movieToSubmit
        })

        publishNotification({
          content: `Movie '${_movieToSubmit.name}' updated`,
          type: 'success'
        })
      }
    }

    setLoadingSystemState(false)
  }

  const handleInvalidation = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  return (
    <ReactForm
      formButtons={memoizedFormButtons}
      formInputs={memoizedFormInputs}
      formInstance={movieForm}
      formTitle={movieFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleInvalidation}
    />
  )
}
