import type { ReactTableProps } from '@base-components/ReactTable'
import type { ActorsModel, CountriesModel, GendersModel } from '@models'
import type { FC } from 'react'

import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useActorForm } from '@hooks/useActorForm'
import { Button } from 'antd'

interface ReactActorsPageProps extends ReactTableProps<ActorsModel> {
  countryList: CountriesModel[]
  genderList: GendersModel[]
}

export const ReactActorsPage: FC<ReactActorsPageProps> = ({ countryList, genderList }) => {
  const { handleCreate } = useActorForm({ countryList, genderList })

  return (
    <ReactComposedTable
      createText="+Actors"
      handleCreate={() => {}}
      isSearching={false}
      noDataConfig={{
        extraContent: <Button onClick={handleCreate}>+Actor</Button>,
        title: 'Sorry, no registered actors'
      }}
      noSearchConfig={{
        title: 'No searchable data'
      }}
      searchConfig={{
        onChange: () => {}
      }}
      tableConfig={{
        columns: [],
        dataSource: []
      }}
      title="Hello there"
    />
  )
}
