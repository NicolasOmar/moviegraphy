import type { MovieEntity } from '@ts/movie'

import ReactInput from '@components/ReactInput'
import { useStore } from '@nanostores/react'
import { $contextSelectedMovie, addMovie, updateMovie, updateMovieContext } from '@store/movie'
import { Button, Form } from 'antd'
import { useFormik } from 'formik'
import { type FC, useMemo } from 'react'

export const ReactMovieForm: FC = () => {
  const contextMovie = useStore($contextSelectedMovie)
  const [antForm] = Form.useForm<MovieEntity>()
  const basicFormik = useFormik<MovieEntity>({
    enableReinitialize: true,
    initialValues: {
      countryMade: '',
      description: '',
      id: '',
      name: '',
      releaseYear: 0
    },
    onSubmit: formObj => {
      if (contextMovie === null) {
        addMovie(formObj)
      } else {
        updateMovie(formObj)
      }

      antForm.resetFields()
      basicFormik.resetForm()
      updateMovieContext(null)
    }
  })
  const submitButtonText = useMemo(() => (contextMovie ? 'Update' : 'Create'), [contextMovie])

  $contextSelectedMovie.listen(_movie => {
    if (_movie) {
      antForm.setFieldsValue(_movie)
      basicFormik.setValues(_movie)
    }
  })

  return (
    <Form
      form={antForm}
      layout="horizontal"
      onFinish={() => basicFormik.submitForm()}
      style={{ padding: '5% 5% 0 5%' }}
    >
      <ReactInput
        label="Name"
        name="name"
        onChange={basicFormik.handleChange}
        value={basicFormik.values.name}
      />
      <ReactInput
        label="Description"
        name="description"
        onChange={basicFormik.handleChange}
        value={basicFormik.values.description}
      />
      <ReactInput
        label="Year of release"
        name="releaseYear"
        onChange={basicFormik.handleChange}
        value={basicFormik.values.releaseYear}
      />
      <ReactInput
        label="Country"
        name="countryMade"
        onChange={basicFormik.handleChange}
        value={basicFormik.values.countryMade}
      />

      <Form.Item>
        <Button htmlType="submit">{submitButtonText}</Button>
      </Form.Item>
    </Form>
  )
}
