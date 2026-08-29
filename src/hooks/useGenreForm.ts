import type { GenresModel } from '@models'
import type { GenreFormModel, GenreWithMovieAmount } from '@ts-types/entities'

import { genreFormInputs, genreFormTitle } from '@feature-components/genres/ReactGenreForm/configs'
import { useStore } from '@nanostores/react'
import {
  $contextSelectedGenre,
  addGenreToListContext,
  deleteGenreOnListContext,
  updateGenresOnListContext,
  updateSelectedGenreOnContext
} from '@store/genres'
import { $globalLoading, setGlobalLoadingState } from '@store/loading'
import { callConfirmModal, type FormModalModel } from '@store/modals'
import { publishNotification } from '@store/notifications'
import {
  API_METHODS,
  API_URLS,
  buildGenreDeleteConfirmationMessage,
  HTTP_STATUS
} from '@ts/constants'
import { fetchWithAuth } from '@ts/helpers'
import { parseModelToFormData, parseResponseErrorToMessage } from '@ts/parsers'
import { Form } from 'antd'
import { useCallback, useEffect } from 'react'

export const useGenreForm = (): FormModalModel<GenreFormModel, GenreWithMovieAmount> => {
  const selectedGenreInContext = useStore($contextSelectedGenre)
  const isSystemLoading = useStore($globalLoading)
  const [genreForm] = Form.useForm<GenreFormModel>()

  useEffect(() => {
    if (selectedGenreInContext) {
      genreForm.setFieldsValue(selectedGenreInContext)
    } else {
      genreForm.resetFields()
    }
  }, [selectedGenreInContext, genreForm])

  const handleSubmit = async (_genreToSubmit: GenreFormModel) => {
    setGlobalLoadingState(true)
    const selectedGenre = $contextSelectedGenre.get()
    const isInCreateMode = selectedGenre === null

    const genreToSend: GenreFormModel = isInCreateMode
      ? _genreToSubmit
      : { ..._genreToSubmit, id: selectedGenre.id }
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
          ...selectedGenre,
          ..._genreToSubmit
        })

        publishNotification({
          content: `Genre '${_genreToSubmit.name}' updated`,
          type: 'success'
        })
      }
    }

    setGlobalLoadingState(false)
  }

  const handleFailedSubmit = () =>
    publishNotification({ content: 'Check the form messages', type: 'error' })

  const handleDeleteAction = async (_genreId: string) => {
    const genreIdToDelete = parseModelToFormData({ id: _genreId })

    const genreDeleteResponse = await fetchWithAuth(API_URLS.GENRES, {
      body: genreIdToDelete,
      method: API_METHODS.DELETE
    })

    if (genreDeleteResponse.status !== HTTP_STATUS.OK) {
      const errorMessage = await parseResponseErrorToMessage(genreDeleteResponse)
      publishNotification({ content: errorMessage, type: 'error' })
    } else {
      deleteGenreOnListContext(_genreId)
      updateSelectedGenreOnContext(null)
      publishNotification({ content: 'Genre deleted', type: 'success' })
    }
  }

  const handleGenreDelete = useCallback(async (_genreToDelete: GenreWithMovieAmount) => {
    setGlobalLoadingState(true)

    if (_genreToDelete.moviesAmount && _genreToDelete.moviesAmount > 0) {
      callConfirmModal({
        content: buildGenreDeleteConfirmationMessage(
          _genreToDelete.name,
          _genreToDelete.moviesAmount
        ),
        onCancel: () => setGlobalLoadingState(false),
        onOk: async () => {
          await handleDeleteAction(_genreToDelete.id)
          setGlobalLoadingState(false)
        }
      })
    } else {
      await handleDeleteAction(_genreToDelete.id)
      setGlobalLoadingState(false)
    }
  }, [])

  return {
    form: {
      formInputs: genreFormInputs,
      formInstance: genreForm,
      formTitle: genreFormTitle,
      isLoading: isSystemLoading,
      onSubmit: handleSubmit,
      onSubmitFailed: handleFailedSubmit
    },
    handleDelete: handleGenreDelete
  }
}
