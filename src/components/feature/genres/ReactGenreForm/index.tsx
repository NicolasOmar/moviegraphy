import { type FormButtonProps, ReactForm } from '@base-components/ReactForm'
import { useGenreForm } from '@hooks/useGenreForm'
import { useStore } from '@nanostores/react'
import { $contextSelectedGenre } from '@store/genres'
import { type FC, useMemo } from 'react'

export const ReactGenreForm: FC = () => {
  const { form } = useGenreForm()
  const selectedGenreInContext = useStore($contextSelectedGenre)

  const memoizedFormButtons = useMemo(() => {
    const submitButtonText = selectedGenreInContext ? 'Update' : 'Create'

    return [{ htmlType: 'submit', title: submitButtonText, type: 'primary' }] as FormButtonProps[]
  }, [selectedGenreInContext])

  return <ReactForm {...form} formButtons={memoizedFormButtons} hidesInResponsive={true} />
}
