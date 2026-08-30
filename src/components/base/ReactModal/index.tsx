import { useStore } from '@nanostores/react'
import { $globalConfirmModal, closeConfirmModal } from '@store/modals'
import { Modal } from 'antd'
import { type FC } from 'react'

export const ReactModal: FC = () => {
  const globalModalStatus = useStore($globalConfirmModal)

  const handleOk = () => {
    if (globalModalStatus?.onOk) {
      globalModalStatus.onOk()
    }

    closeConfirmModal()
  }

  const handleCancel = () => {
    if (globalModalStatus?.onCancel) {
      globalModalStatus.onCancel()
    }

    closeConfirmModal()
  }

  return globalModalStatus !== null ? (
    <Modal
      closable={{ 'aria-label': 'Custom Close Button' }}
      onCancel={handleCancel}
      onOk={handleOk}
      open={globalModalStatus !== null}
      title={globalModalStatus.title}
    >
      {globalModalStatus.content}
    </Modal>
  ) : null
}
