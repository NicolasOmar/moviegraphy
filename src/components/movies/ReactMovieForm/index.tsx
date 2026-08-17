import type { MoviesModel } from '@models'
import type { MovieFormModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'

import { ReactForm, type ReactFormButtonProps } from '@components/shared/ReactForm'
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
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'
import { type FC, useMemo } from 'react'

const movieFormTitle = 'Create a new movie'
const movieFormInputs: FormInputList<MovieFormModel> = [
  {
    label: 'Name',
    name: 'name',
    rules: [
      { message: 'Name is required', required: true },
      { max: 300, message: 'Name must be 150 characters as much' }
    ]
  },
  {
    label: 'Description',
    name: 'description',
    rules: [{ max: 300, message: 'Description must be 300 characters as much' }]
  },
  {
    label: 'Year of release',
    name: 'releaseYear',
    rules: [
      { message: 'Year of release is required', required: true },
      { max: 3000, min: 1850, type: 'number' }
    ],
    type: 'number'
  },
  {
    label: 'Country',
    name: 'countryMade',
    rules: [{ message: 'Country is required', required: true }]
  }
]

export const ReactMovieForm: FC = () => {
  const selectedMovieInContext = useStore($contextSelectedMovie)
  const isSystemLoading = useStore($contextLoading)
  const [movieForm] = Form.useForm<MovieFormModel>()

  const memoizedFormButtons = useMemo(() => {
    const submitButtonText = selectedMovieInContext ? 'Update' : 'Create'

    return [
      { htmlType: 'submit', title: submitButtonText, type: 'primary' }
    ] as ReactFormButtonProps[]
  }, [selectedMovieInContext])

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      movieForm.setFieldsValue(_movie)
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
        const newMovieFinal = (await movieCreateResponse.json()).message as MoviesModel

        movieForm.resetFields()
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
        movieForm.resetFields()
        updateSelectedMovieOnContext(null)
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
      formInputs={movieFormInputs}
      formInstance={movieForm}
      formTitle={movieFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={handleInvalidation}
    />
  )
}
