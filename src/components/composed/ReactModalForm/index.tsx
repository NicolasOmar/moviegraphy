import { ReactForm } from '@base-components/ReactForm'
import { useStore } from '@nanostores/react'
import { $globalFormModal, clearFormModal } from '@store/modals'
import { COMMON_LABELS } from '@ts/constants'
import { Modal } from 'antd'

export const ReactModalForm = () => {
  const globalFormModalStatus = useStore($globalFormModal)

  if (globalFormModalStatus === null) {
    return null
  }

  const handleOk = (_formData: unknown) => {
    if (globalFormModalStatus.onOk) {
      globalFormModalStatus.onOk()
    }

    globalFormModalStatus.form.onSubmit(_formData)

    clearFormModal()
  }

  const handleCancel = () => {
    if (globalFormModalStatus.onCancel) {
      globalFormModalStatus.onCancel()
    }

    globalFormModalStatus.form.formInstance.resetFields()

    clearFormModal()
  }

  const handleFail = () => {
    if (globalFormModalStatus.form.onSubmitFailed) {
      globalFormModalStatus.form.onSubmitFailed()
    } else {
      console.error('onSubmitFailed')
    }
  }

  return (
    <Modal
      closable={{ 'aria-label': 'Custom Close Button' }}
      footer={[]}
      onCancel={handleCancel}
      onOk={handleOk}
      open
      title={globalFormModalStatus.title}
    >
      <ReactForm
        {...{
          ...globalFormModalStatus.form,
          formButtons: [
            {
              htmlType: 'submit',
              title: globalFormModalStatus.okText ?? COMMON_LABELS.CONFIRM,
              type: 'primary'
            },
            {
              htmlType: 'button',
              onClick: handleCancel,
              title: globalFormModalStatus.cancelText ?? COMMON_LABELS.CANCEL,
              type: 'text'
            }
          ],
          onSubmit: handleOk,
          onSubmitFailed: handleFail
        }}
      />
    </Modal>
  )
}
