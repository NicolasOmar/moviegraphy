import { ReactForm } from '@base-components/ReactForm'
import { useStore } from '@nanostores/react'
import { $globalFormModal, clearFormModal } from '@store/modals'
import { Modal } from 'antd'

export const ReactModalForm = () => {
  const globalFormModalStatus = useStore($globalFormModal)

  const handleOk = (_formData: unknown) => {
    if (globalFormModalStatus?.onOk) {
      globalFormModalStatus.onOk()
    }

    if (globalFormModalStatus) {
      globalFormModalStatus.form.onSubmit(_formData)
    }

    clearFormModal()
  }

  const handleCancel = () => {
    if (globalFormModalStatus?.onCancel) {
      globalFormModalStatus.onCancel()
    }

    clearFormModal()
  }

  return globalFormModalStatus !== null ? (
    <Modal
      closable={{ 'aria-label': 'Custom Close Button' }}
      footer={[]}
      onCancel={handleCancel}
      onOk={handleOk}
      open={globalFormModalStatus !== null}
      title={globalFormModalStatus.title}
    >
      <ReactForm
        {...{
          ...globalFormModalStatus.form,
          formButtons: [
            {
              htmlType: 'submit',
              title: globalFormModalStatus.okText ?? 'Confirm',
              type: 'primary'
            },
            {
              htmlType: 'button',
              onClick: () => handleCancel(),
              title: globalFormModalStatus.cancelText ?? 'Cancel',
              type: 'text'
            }
          ],
          onSubmit: handleOk,
          onSubmitFailed: () => console.error('onSubmitFailed')
        }}
      />
    </Modal>
  ) : null
}
