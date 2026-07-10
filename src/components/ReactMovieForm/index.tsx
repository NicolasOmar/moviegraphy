import { Button, Form } from 'antd'
import { useFormik } from 'formik'
import type { FC } from 'react'
import ReactInput from '@components/ReactInput'
import { addMovie } from '@store/movie'
import type { MovieEntity } from '@ts/movie'

export const ReactMovieForm: FC = () => {
  const basicFormik = useFormik<MovieEntity>({
    initialValues: {
      name: '',
      description: '',
      releaseYear: 0,
      countryMade: ''
    },
    onSubmit: formObj => {
      addMovie(formObj)
      basicFormik.resetForm()
    }
  })

  return (
    <Form
      layout="horizontal"
      style={{ padding: '5% 5% 0 5%' }}
      onFinish={() => basicFormik.submitForm()}
    >
      <ReactInput
        id="name"
        name="name"
        label="Name"
        value={basicFormik.values.name}
        onChange={basicFormik.handleChange}
      />
      <ReactInput
        id="description"
        name="description"
        label="Description"
        value={basicFormik.values.description}
        onChange={basicFormik.handleChange}
      />
      <ReactInput
        id="releaseYear"
        name="releaseYear"
        label="Year of release"
        value={basicFormik.values.releaseYear}
        onChange={basicFormik.handleChange}
      />
      <ReactInput
        id="countryMade"
        name="countryMade"
        label="Country"
        value={basicFormik.values.countryMade}
        onChange={basicFormik.handleChange}
      />

      <Form.Item>
        <Button htmlType="submit">Create movie</Button>
      </Form.Item>
    </Form>
  )
}
