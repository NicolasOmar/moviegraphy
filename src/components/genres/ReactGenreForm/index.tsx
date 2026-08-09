import type { GenreCreateModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'
import type { FC } from 'react'

import { ReactForm, type ReactFormButtonProps } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { Form } from 'antd'

const genreCreateTitle = 'Create new Genre'
const genreCreateInputs: FormInputList<GenreCreateModel> = [
  {
    label: 'Name',
    name: 'name',
    rules: [{ message: 'The name is required', required: true }, { max: 300 }],
    type: 'text'
  }
]
const genreCreateButtons: ReactFormButtonProps[] = [
  { htmlType: 'submit', title: 'Create', type: 'primary' }
]

export const ReactGenreForm: FC = () => {
  const [genreCreateForm] = Form.useForm<GenreCreateModel>()
  const isSystemLoading = useStore($contextLoading)

  const handleSubmit = async (_formData: GenreCreateModel) => {
    setLoadingSystemState(true)
    console.warn(_formData)
    setLoadingSystemState(false)
  }

  return (
    <ReactForm
      formButtons={genreCreateButtons}
      formInputs={genreCreateInputs}
      formInstance={genreCreateForm}
      formTitle={genreCreateTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={() => console.error('ERROR')}
    />
  )
}
