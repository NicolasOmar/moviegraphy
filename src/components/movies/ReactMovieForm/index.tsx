import type { MovieModel } from '@models'
import type { FormInputList } from '@ts/types'

import ReactFormInput from '@components/shared/ReactFormInput'
import { useStore } from '@nanostores/react'
import { addMessageToContext } from '@store/message'
import {
  $contextSelectedMovie,
  addMovieToListContext,
  updateMovieOnListContext,
  updateSelectedMovieOnContext
} from '@store/movie'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Button, Form, Typography } from 'antd'
import { type FC, useMemo } from 'react'
import { API_METHODS, API_URL, HTTP_STATUS } from 'ts/constants'

const formInputs: FormInputList<MovieModel> = [
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
  const [movieForm] = Form.useForm<MovieModel>()
  const submitButtonText = useMemo(
    () => (selectedMovieInContext ? 'Update' : 'Create'),
    [selectedMovieInContext]
  )

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      movieForm.setFieldsValue(_movie)
    }
  })

  const handleSubmit = async (_movieFormDataModel: MovieModel) => {
    if (selectedMovieInContext === null) {
      const movieToCreate = parseModelToFormData(_movieFormDataModel)

      const movieCreateResponse = await fetch(API_URL.MOVIES, {
        body: movieToCreate,
        method: API_METHODS.POST
      })

      if (movieCreateResponse.status !== HTTP_STATUS.OK) {
        const errorMessage = await parseResponseErrorToMessage(movieCreateResponse)
        addMessageToContext({ content: errorMessage, type: 'error' })
      } else {
        const newMovieFinal = (await movieCreateResponse.json()).message as MovieModel

        movieForm.resetFields()
        addMovieToListContext(newMovieFinal)
        addMessageToContext({ content: 'Movie created', type: 'success' })
      }
    } else {
      const movieToUpdate = parseModelToFormData({
        ..._movieFormDataModel,
        id: selectedMovieInContext.id
      })

      const movieUpdateResponse = await fetch(API_URL.MOVIES, {
        body: movieToUpdate,
        method: API_METHODS.PATCH
      })

      if (movieUpdateResponse.status !== HTTP_STATUS.OK) {
        const errorMessage = await parseResponseErrorToMessage(movieUpdateResponse)
        addMessageToContext({ content: errorMessage, type: 'error' })
      } else {
        movieForm.resetFields()
        updateSelectedMovieOnContext(null)
        updateMovieOnListContext({
          ..._movieFormDataModel,
          id: selectedMovieInContext.id
        })

        addMessageToContext({
          content: `Movie '${_movieFormDataModel.name}' updated`,
          type: 'success'
        })
      }
    }
  }

  const handleInvalidation = () =>
    addMessageToContext({ content: 'Check the form messages', type: 'error' })

  return (
    <section>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        Create a new movie
      </Typography.Title>

      <Form
        form={movieForm}
        initialValues={{
          countryMade: '',
          description: '',
          id: '',
          name: '',
          releaseYear: 2026
        }}
        layout="horizontal"
        onFinish={handleSubmit}
        onFinishFailed={handleInvalidation}
        style={{ padding: '0 5%' }}
      >
        {formInputs.map((_inputConfig, _inputIndex) => (
          <ReactFormInput key={`movie-form-${_inputIndex}`} {..._inputConfig} />
        ))}

        <Form.Item>
          <Button htmlType="submit">{submitButtonText}</Button>
        </Form.Item>
      </Form>
    </section>
  )
}
