import type { MovieEntity } from '@ts/movie'
import type { FC } from 'react'

import ReactInput from '@components/ReactInput'
import { addMovie } from '@store/movie'
import { Button, Form } from 'antd'
import { useFormik } from 'formik'

export const ReactMovieForm: FC = () => {
  const basicFormik = useFormik<MovieEntity>({
    initialValues: {
      countryMade: '',
      description: '',
      id: '',
      name: '',
      releaseYear: 0
    },
    onSubmit: formObj => {
      addMovie(formObj)
      basicFormik.resetForm()
    }
  })

  return (
    <Form
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
        <Button htmlType="submit">Create movie</Button>
      </Form.Item>
    </Form>
  )
}
