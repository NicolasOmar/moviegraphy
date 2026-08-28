import type { GenresModel } from '@models'
import type { FormModalModel } from '@store/modals'
import type { GenreFormModel } from '@ts-types/entities'

import { genreFormInputs, genreFormTitle } from '@feature-components/genres/ReactGenreForm/configs'
import { useStore } from '@nanostores/react'
import {
  $contextSelectedGenre,
  addGenreToListContext,
  updateGenresOnListContext,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $contextLoading, setLoadingSystemState } from '@store/loading'
import { publishNotification } from '@store/notifications'
import { API_METHODS, API_URLS, HTTP_STATUS } from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'

export const useGenreForm = (): FormModalModel<GenreFormModel> => {
  const selectedGenreInContext = useStore($contextSelectedGenre)
  const isSystemLoading = useStore($contextLoading)
  const [genreForm] = Form.useForm<GenreFormModel>()

  const handleSubmit = async (_genreToSubmit: GenreFormModel) => {
    setLoadingSystemState(true)

    const isInCreateMode = selectedGenreInContext === null
    const genreToSend: GenreFormModel = isInCreateMode
      ? _genreToSubmit
      : { ..._genreToSubmit, id: selectedGenreInContext.id }
    const genreFormData = parseModelToFormData(genreToSend)

    if (isInCreateMode) {
      const genreCreateResponse = await fetchWithAuth(API_URLS.GENRES, {
        body: genreFormData,
        method: API_METHODS.POST
      })

      if (genreCreateResponse.status !== HTTP_STATUS.OK) {
        const errorMessage = await parseResponseErrorToMessage(genreCreateResponse)
        publishNotification({ content: errorMessage, type: 'error' })
      } else {
        const newGenre = (await genreCreateResponse.json()).message as GenresModel

        genreForm.resetFields()
        addGenreToListContext(newGenre)
        publishNotification({ content: 'Genre created', type: 'success' })
      }
    } else {
      const genreUpdateResponse = await fetchWithAuth(API_URLS.GENRES, {
        body: genreFormData,
        method: API_METHODS.PATCH
      })

      if (genreUpdateResponse.status !== HTTP_STATUS.OK) {
        const errorMessage = await parseResponseErrorToMessage(genreUpdateResponse)
        publishNotification({ content: errorMessage, type: 'error' })
      } else {
        genreForm.resetFields()

        updateSelectedGenreOnContext(null)
        updateGenresOnListContext({
          ...selectedGenreInContext,
          ..._genreToSubmit
        })

        publishNotification({
          content: `Genre '${_genreToSubmit.name}' updated`,
          type: 'success'
        })
      }
    }

    setLoadingSystemState(false)
  }

  const handleInvalidation = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  return {
    form: {
      formInputs: genreFormInputs,
      formInstance: genreForm,
      formTitle: genreFormTitle,
      isLoading: isSystemLoading,
      onSubmit: handleSubmit,
      onSubmitFailed: handleInvalidation
    }
  }
}
