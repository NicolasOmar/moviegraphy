import type { MovieModel } from '@models'

import ReactFormInput from '@components/shared/ReactFormInput'
import { useStore } from '@nanostores/react'
import {
  $contextSelectedMovie,
  addMovieToListContext,
  updateMovieOnListContext,
  updateSelectedMovieOnContext
} from '@store/movie'
import { parseModelToFormData } from '@ts/parsers'
import { Button, Form } from 'antd'
import { type FC, useMemo } from 'react'
import { API_METHODS, API_URL } from 'ts/constants'

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

      await fetch(API_URL.MOVIES, {
        body: movieToCreate,
        method: API_METHODS.POST
      })

      addMovieToListContext(_movieFormDataModel)
    } else {
      const movieToUpdate = parseModelToFormData({
        ..._movieFormDataModel,
        id: selectedMovieInContext.id
      })

      await fetch(API_URL.MOVIES, {
        body: movieToUpdate,
        method: API_METHODS.PATCH
      })

      updateMovieOnListContext({
        ..._movieFormDataModel,
        id: selectedMovieInContext.id
      })

      updateSelectedMovieOnContext(null)
    }

    movieForm.resetFields()
  }

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      movieForm.setFieldsValue(_movie)
    }
  })

  return (
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
      style={{ padding: '5% 5% 0 5%' }}
    >
      <ReactFormInput label="Name" name="name" />
      <ReactFormInput label="Description" name="description" />
      <ReactFormInput label="Year of release" name="releaseYear" />
      <ReactFormInput label="Country" name="countryMade" />

      <Form.Item>
        <Button htmlType="submit">{submitButtonText}</Button>
      </Form.Item>
    </Form>
  )
}
