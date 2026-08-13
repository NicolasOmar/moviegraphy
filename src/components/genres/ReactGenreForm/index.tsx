import type { GenresModel } from '@models'
import type { GenreCreateModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'
import type { FC } from 'react'

import { ReactForm, type ReactFormButtonProps } from '@components/shared/ReactForm'
import { useStore } from '@nanostores/react'
import { addGenreToListContext } from '@store/genres'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { addMessageToContext } from '@store/messages'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'

const genreFormTitle = 'Create new Genre'
const genreFormInputs: FormInputList<GenreCreateModel> = [
  {
    label: 'Name',
    name: 'name',
    rules: [{ message: 'The name is required', required: true }, { max: 300 }],
    type: 'text'
  }
]
const genreFormButtons: ReactFormButtonProps[] = [
  { htmlType: 'submit', title: 'Create', type: 'primary' }
]

export const ReactGenreForm: FC = () => {
  const [genreForm] = Form.useForm<GenreCreateModel>()
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
      const newGenre = (await genreCreateResponse.json()).message as GenresModel

      genreForm.resetFields()
      addGenreToListContext(newGenre)
      addMessageToContext({ content: 'Genre created', type: 'success' })
    }

    setLoadingSystemState(false)
  }

  return (
    <ReactForm
      formButtons={genreFormButtons}
      formInputs={genreFormInputs}
      formInstance={genreForm}
      formTitle={genreFormTitle}
      isLoading={isSystemLoading}
      onSubmit={handleSubmit}
      onSubmitFailed={() => console.error('ERROR')}
    />
  )
}
