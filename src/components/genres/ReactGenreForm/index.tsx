import type { GenreCreateModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'
import type { FC } from 'react'

import { ReactForm, type ReactFormButtonProps } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { addMessageToContext } from '@store/messages'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
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

    const genreToCreate = parseModelToFormData(_formData)

    const genreCreateResponse = await fetchWithAuth(API_URLS.GENRES, {
      body: genreToCreate,
      method: API_METHODS.POST
    })

    if (genreCreateResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(genreCreateResponse)
      addMessageToContext({ content: errorMessage, type: 'error' })
    } else {
      addMessageToContext({ content: 'Genre created', type: 'success' })
    }

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
