import ReactInput from '@components/ReactInput'
import type { Movie } from '@ts/movie'
import { useFormik } from 'formik'
import type { FC } from 'react'

export const ReactMovieForm: FC = () => {
  const basicFormik = useFormik<Movie>({
    initialValues: {
      name: '',
      description: '',
      releaseYear: 0,
      countryMade: ''
    },
    onSubmit: formObj => console.warn(formObj)
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        basicFormik.submitForm()
      }}
    >
      <ReactInput
        id="name"
        name="name"
        value={basicFormik.values.name}
        onChange={basicFormik.handleChange}
      />
      <ReactInput
        id="description"
        name="description"
        value={basicFormik.values.description}
        onChange={basicFormik.handleChange}
      />
      <ReactInput
        id="releaseYear"
        name="releaseYear"
        value={basicFormik.values.releaseYear}
        onChange={basicFormik.handleChange}
      />
      <ReactInput
        id="countryMade"
        name="countryMade"
        value={basicFormik.values.countryMade}
        onChange={basicFormik.handleChange}
      />

      <button type="submit">Create movie</button>
    </form>
  )
}
