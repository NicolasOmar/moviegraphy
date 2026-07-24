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
  { label: 'Name', name: 'name' },
  { label: 'Description', name: 'description' },
  { label: 'Year of release', name: 'releaseYear' },
  { label: 'Country', name: 'countryMade' }
]

export const ReactMovieForm: FC = () => {
  const selectedMovieInContext = useStore($contextSelectedMovie)
  const [movieForm] = Form.useForm<MovieModel>()
  const submitButtonText = useMemo(
    () => (selectedMovieInContext ? 'Update' : 'Create'),
    [selectedMovieInContext]
  )

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

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      movieForm.setFieldsValue(_movie)
    }
  })

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
          releaseYear: 0
        }}
        layout="horizontal"
        onFinish={handleSubmit}
        style={{ padding: '0 5%' }}
      >
        {formInputs.map((_inputConfig, _index) => (
          <ReactFormInput key={`movie-form-${_index}`} {..._inputConfig} />
        ))}

        <Form.Item>
          <Button htmlType="submit">{submitButtonText}</Button>
        </Form.Item>
      </Form>
    </section>
  )
}
