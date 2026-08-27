import { useStore } from '@nanostores/react'
import { $globalModal, clearModal } from '@store/modals'
import { Modal } from 'antd'
import { type FC } from 'react'

export const ReactModal: FC = () => {
  const modalStatus = useStore($globalModal)

  const handleOk = () => {
    if (modalStatus && modalStatus.onOk) {
      modalStatus.onOk()
    }

    clearModal()
  }

  const handleCancel = () => {
    if (modalStatus && modalStatus.onCancel) {
      modalStatus.onCancel()
    }

    clearModal()
  }

  return modalStatus ? (
    <Modal
      closable={{ 'aria-label': 'Custom Close Button' }}
      onCancel={handleCancel}
      onOk={handleOk}
      open={modalStatus !== null}
      title={modalStatus.title}
    >
      {modalStatus.content}
    </Modal>
  ) : null
}
