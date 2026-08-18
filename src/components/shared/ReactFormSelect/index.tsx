import type { FormSelect } from '@ts/types'

import { Select } from 'antd'
import { type FC } from 'react'

const ReactFormSelect: FC<FormSelect> = ({ handleChange, options, values }) => (
  <Select
    allowClear
    defaultValue={values}
    mode="multiple"
    onChange={handleChange}
    options={options}
    // style={{ width: '100%' }}
    placeholder="Please select"
  />
)

export default ReactFormSelect
