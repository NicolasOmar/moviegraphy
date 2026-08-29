import { type FormButtonProps, ReactForm } from '@base-components/ReactForm'
import { useGenreForm } from '@hooks/useGenreForm'
import { useStore } from '@nanostores/react'
import { $contextSelectedGenre, updateSelectedGenreOnContext } from '@store/genres'
import { type FC, useCallback, useMemo } from 'react'

export const ReactGenreForm: FC = () => {
  const selectedGenreInContext = useStore($contextSelectedGenre)
  const { form } = useGenreForm()

  const handleCancel = useCallback(() => {
    form.formInstance.resetFields()
    updateSelectedGenreOnContext(null)
  }, [form.formInstance])

  const memoizedFormButtons = useMemo(() => {
    const submitButtonText = selectedGenreInContext ? 'Update' : 'Create'

    return [
      { htmlType: 'submit', title: submitButtonText, type: 'primary' },
      { htmlType: 'button', onClick: handleCancel, title: 'Cancel', type: 'text' }
    ] as FormButtonProps[]
  }, [selectedGenreInContext, handleCancel])

  return <ReactForm {...form} formButtons={memoizedFormButtons} hidesInResponsive={true} />
}
