import type { MovieModel } from '@models'

import ReactFormInput from '@components/shared/ReactFormInput'
import { useStore } from '@nanostores/react'
import {
  $contextSelectedMovie,
  addMovieToContext,
  setSingleMovieOnContext,
  updateMovieOnContext
} from '@store/movie'
import { Button, Form } from 'antd'
import { type FC, useMemo } from 'react'
import { API_URL } from 'ts/constants'

const parseToFormData = <T extends object>(rawFormData: T): FormData => {
  const _formData = new FormData()

  ;(Object.keys(rawFormData) as Array<keyof T>).forEach(key =>
    _formData.append(String(key), String(rawFormData[key]))
  )

  return _formData
}

export const ReactMovieForm: FC = () => {
  const contextMovie = useStore($contextSelectedMovie)
  const [antForm] = Form.useForm<MovieModel>()
  const submitButtonText = useMemo(() => (contextMovie ? 'Update' : 'Create'), [contextMovie])

  const handleSubmit = async (movieFormData: MovieModel) => {
    if (contextMovie === null) {
      const parsedFormData = parseToFormData(movieFormData)

      await fetch(API_URL.CREATE_MOVIE, {
        body: parsedFormData,
        method: 'POST'
      })

      addMovieToContext(movieFormData)
    } else {
      updateMovieOnContext({
        ...movieFormData,
        id: contextMovie.id
      })
    }

    antForm.resetFields()
    setSingleMovieOnContext(null)
  }

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      antForm.setFieldsValue(_movie)
    }
  })

  return (
    <Form
      form={antForm}
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
