import { Layout, Menu } from 'antd'
import { type FC, useMemo } from 'react'

interface ReactLayoutProps {
  children: React.ReactNode
  listOfLinks: {
    key: string
    label: string
    link: string
  }[]
}

export const ReactLayout: FC<ReactLayoutProps> = ({ children, listOfLinks }) => {
  const memoizedLinks = useMemo(() => {
    const parsedList = listOfLinks.map(({ key, label, link }) => ({
      key,
      label: <a href={link}>{label}</a>
    }))

    return (
      <Menu
        items={parsedList}
        mode="horizontal"
        onClick={e => console.warn(e)}
        style={{ flex: 1, minWidth: 0, width: '100vw' }}
      />
    )
  }, [listOfLinks])
  return (
    <Layout>
      <Layout.Header
        style={{
          display: 'flex',
          padding: 0,
          width: '100vw'
        }}
      >
        {memoizedLinks}
      </Layout.Header>
      <Layout.Content>{children}</Layout.Content>
    </Layout>
  )
}
