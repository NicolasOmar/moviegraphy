import type { ReactTableProps } from '@base-components/ReactTable'
import type { ActorsModel, CountriesModel, GendersModel } from '@models'

import { ReactComposedTable } from '@composed-components/ReactComposedTable'
import { useActorForm } from '@hooks/useActorForm'
import { useStore } from '@nanostores/react'
import { $contextActorList, setActorListOnContext } from '@store/actors'
import { ACTOR_LABELS, COMMON_LABELS } from '@ts/constants'
import { Button } from 'antd'
import { type FC, useEffect, useMemo } from 'react'

interface ReactActorsPageProps extends ReactTableProps<ActorsModel> {
  countryList: CountriesModel[]
  genderList: GendersModel[]
}

export const ReactActorsPage: FC<ReactActorsPageProps> = ({
  columns,
  countryList,
  dataSource,
  genderList
}) => {
  const actorListInContext = useStore($contextActorList)
  const { handleCreate, handleSearch, handleView, isLoading, searchTerm } = useActorForm({
    countryList,
    genderList
  })

  useEffect(() => setActorListOnContext(dataSource ?? []), [dataSource])

  const isSearching = useMemo(() => searchTerm !== null, [searchTerm])

  const memoizedActorTableConfig = useMemo(() => {
    const optionsColumn = {
      key: 'options',
      render: (_singleActor: ActorsModel) => (
        <>
          <Button disabled={isLoading} onClick={() => handleView(_singleActor)}>
            {COMMON_LABELS.VIEW}
          </Button>
          {/* <Button disabled={isLoading} onClick={() => handleUpdate(_singleActor)}>
            {COMMON_LABELS.EDIT}
          </Button>
          <Button disabled={isLoading} onClick={() => handleDelete(_singleActor)}>
            {COMMON_LABELS.DELETE}
          </Button> */}
        </>
      ),
      title: COMMON_LABELS.OPTIONS
    }
    const filteredDataSoruce =
      searchTerm === null
        ? actorListInContext
        : actorListInContext.filter(({ name }) =>
            name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
          )

    return {
      columns: [...columns, optionsColumn],
      dataSource: filteredDataSoruce
    }
  }, [columns, actorListInContext, isLoading, searchTerm, handleView])

  return (
    <ReactComposedTable
      createText={ACTOR_LABELS.NEW_BTN}
      handleCreate={handleCreate}
      isSearching={isSearching}
      noDataConfig={{
        extraContent: <Button onClick={handleCreate}>{COMMON_LABELS.NEW_BTN}</Button>,
        title: ACTOR_LABELS.NO_DATA
      }}
      noSearchConfig={{
        title: ACTOR_LABELS.NO_SEARCH_DATA
      }}
      searchConfig={{
        onChange: handleSearch,
        placeholder: COMMON_LABELS.SEARCH_BY_NAME
      }}
      tableConfig={memoizedActorTableConfig}
      title={ACTOR_LABELS.TITLE}
    />
  )
}
