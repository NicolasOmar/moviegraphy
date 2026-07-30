import type { PasswordChangeModel } from '@ts/entities'
import type { FormInputList } from '@ts/types'
import type { FC } from 'react'

import { ReactForm } from '@components/shared/ReactForm'
import { Form } from 'antd'

const formInputs: FormInputList<PasswordChangeModel> = [
  { label: 'Old password', name: 'old' },
  { label: 'New password', name: 'new' },
  { label: 'Repeat new password', name: 'repeatNew' }
]

export const ReactPasswordForm: FC = () => {
  const [passwordForm] = Form.useForm<PasswordChangeModel>()
  return (
    <ReactForm
      formButtons={[]}
      formInputs={formInputs}
      formInstance={passwordForm}
      onSubmit={_form => console.warn({ _form })}
      onSubmitFailed={() => console.error('Error')}
    />
  )
}
