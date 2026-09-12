import type { ReactTableProps } from '@base-components/ReactTable'
import type { ActorsModel, CountriesModel, GendersModel } from '@models'
import type { FC } from 'react'

import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useActorForm } from '@hooks/useActorForm'
import { ACTOR_LABELS, COMMON_LABELS } from '@ts/constants'
import { Button } from 'antd'

interface ReactActorsPageProps extends ReactTableProps<ActorsModel> {
  countryList: CountriesModel[]
  genderList: GendersModel[]
}

export const ReactActorsPage: FC<ReactActorsPageProps> = ({ countryList, genderList }) => {
  const { handleCreate } = useActorForm({ countryList, genderList })

  return (
    <ReactComposedTable
      createText={ACTOR_LABELS.NEW_BTN}
      handleCreate={() => {}}
      isSearching={false}
      noDataConfig={{
        extraContent: <Button onClick={handleCreate}>{COMMON_LABELS.NEW_BTN}</Button>,
        title: ACTOR_LABELS.NO_DATA
      }}
      noSearchConfig={{
        title: ACTOR_LABELS.NO_SEARCH_DATA
      }}
      searchConfig={{
        onChange: () => {}
      }}
      tableConfig={{
        columns: [],
        dataSource: []
      }}
      title={ACTOR_LABELS.TITLE}
    />
  )
}
