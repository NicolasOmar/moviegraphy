import type { MovieEntity } from '@ts/movie'

import ReactFormInput from '@components/ReactFormInput'
import { useStore } from '@nanostores/react'
import { $contextSelectedMovie, addMovie, updateMovie, updateMovieContext } from '@store/movie'
import { Button, Form } from 'antd'
import { type FC, useMemo } from 'react'

export const ReactMovieForm: FC = () => {
  const contextMovie = useStore($contextSelectedMovie)
  const [antForm] = Form.useForm<MovieEntity>()
  const submitButtonText = useMemo(() => (contextMovie ? 'Update' : 'Create'), [contextMovie])

  const handleSubmit = (movieFormData: MovieEntity) => {
    if (contextMovie === null) {
      addMovie(movieFormData)
    } else {
      updateMovie({
        ...movieFormData,
        id: contextMovie.id
      })
    }

    antForm.resetFields()
    updateMovieContext(null)
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
