import { useStore } from '@nanostores/react'
import { $globalViewModal, clearViewModal } from '@store/modals'
import { Modal, Space } from 'antd'

export const ReactModalView = () => {
  const globalViewModalStatus = useStore($globalViewModal)

  if (globalViewModalStatus === null) {
    return null
  }

  return (
    <Modal
      closable={{ 'aria-label': 'Custom Close Button' }}
      footer={[]}
      onCancel={clearViewModal}
      open
      title={globalViewModalStatus.title}
    >
      <Space orientation="vertical">
        {Object.entries(globalViewModalStatus.content).map(([key, value], contentI) => {
          return (
            <Space key={contentI}>
              <p>{key}:</p>
              <p>{value}</p>
            </Space>
          )
        })}
      </Space>
    </Modal>
  )
}
