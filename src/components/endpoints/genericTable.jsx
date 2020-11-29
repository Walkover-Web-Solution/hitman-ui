import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import './endpoints.scss'

class GenericTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bulkEdit: false,
      editButtonName: 'Bulk Edit',
      originalParams: [],
      originalHeaders: []
    }

    this.checkboxFlags = []
    this.textAreaValue = ''
    this.textAreaValueFlag = true
    this.helperflag = false
    this.count = ''
  }

  handleChange = (e) => {
    let { dataArray, title } = this.props
    dataArray = JSON.parse(JSON.stringify(dataArray))
    const name = e.currentTarget.name.split('.')
    if (name[1] === 'checkbox') {
      this.checkboxFlags[name[0]] = true
      if (dataArray[name[0]].checked === 'true') {
        dataArray[name[0]].checked = 'false'
      } else {
        dataArray[name[0]].checked = 'true'
      }
    }
    if (name[1] === 'key' && title !== 'Path Variables') {
      dataArray[name[0]].key = e.currentTarget.value
      if (title === 'Params' && dataArray[name[0]].key.length === 0) {
        this.handleDelete(dataArray, name[0], title)
      }
    } else if (title !== 'Path Variables' || name[1] !== 'key') {
      dataArray[name[0]][name[1]] = e.currentTarget.value
    }

    if (
      dataArray[name[0]][name[1]].length !== 0 &&
      !this.checkboxFlags[name[0]] &&
      title !== 'Path Variables'
    ) {
      dataArray[name[0]].checked = 'true'
    }

    if (title !== 'Path Variables') {
      this.handleAdd(dataArray, title, dataArray[name[0]][name[1]], name[0])
    }

    if (title === 'Headers' || title === 'Params' || title === 'Path Variables') { this.props.props_from_parent(title, dataArray) }
    if (title === 'formData' || title === 'x-www-form-urlencoded') { this.props.handle_change_body_data(title, dataArray) }
  };

  handleBulkChange = (e) => {
    const { title } = this.props
    const dataArray = []
    this.textAreaValue = e.currentTarget.value
    const array = e.currentTarget.value.split('\n')
    let j = 0
    for (let i = 0; i < array.length; i++) {
      let key = array[i].split(':')[0]
      key = key.trim()
      let value = ''
      if (array[i].split(':')[1]) value = array[i].split(':')[1]
      if (key === '' && value === '') continue
      let obj = {}
      if (key.substring(0, 2) === '//' && key.length > 2) {
        key = key.substring(2)
        obj = { checked: 'false', key, value, description: '' }
      } else if (
        key.substring(0, 2) === '//' &&
        key.length === 2 &&
        value.length === 0
      ) { continue } else if (
        key.substring(0, 2) === '//' &&
        key.length === 2 &&
        value.length !== 0
      ) {
        key = key.substring(2)
        obj = { checked: 'false', key, value, description: '' }
      } else {
        obj = { checked: 'true', key, value, description: '' }
      }
      dataArray[j.toString()] = obj
      j++
    }
    dataArray[j.toString()] = {
      checked: 'notApplicable',
      key: '',
      value: '',
      description: ''
    }
    if (title === 'Params' || title === 'Headers') { this.props.props_from_parent(title, dataArray) }
    if (title === 'formData' || title === 'x-www-form-urlencoded') { this.props.handle_change_body_data(title, dataArray) }
  };

  handleAdd(dataArray, title, key, index) {
    index = parseInt(index) + 1
    if (key.length >= 1 && !dataArray[index]) {
      const len = dataArray.length
      dataArray[len.toString()] = {
        checked: 'notApplicable',
        key: '',
        value: '',
        description: ''
      }
      if (title === 'Headers') this.props.props_from_parent(title, dataArray)
      if (title === 'Params') { this.props.props_from_parent('handleAddParam', dataArray) }
    }
  }

  handleDelete(dataArray, index, title) {
    const newDataArray = []
    for (let i = 0; i < dataArray.length; i++) {
      if (i === index) {
        continue
      }
      newDataArray.push(dataArray[i])
    }
    dataArray = newDataArray
    if (title === 'Headers' || title === 'Params') { this.props.props_from_parent(title, dataArray) }
    if (title === 'formData' || title === 'x-www-form-urlencoded') { this.props.handle_change_body_data(title, dataArray) }
  }

  displayEditButton() {
    if (this.state.bulkEdit) {
      this.setState({
        bulkEdit: false,
        editButtonName: 'Bulk Edit'
      })
    } else {
      if (!this.helperflag && this.textAreaValueFlag) {
        this.helperflag = true
      } else {
        this.textAreaValueFlag = true
      }
      this.setState({
        bulkEdit: true,
        editButtonName: 'Key-Value Edit'
      })
    }
  }

  autoFillBulkEdit() {
    let textAreaValue = ''
    const { dataArray, count } = this.props
    if (count) {
      if (
        (this.state.bulkEdit && this.textAreaValueFlag) ||
        this.count !== count
      ) {
        this.count = count
        this.textAreaValueFlag = false
        for (let index = 0; index < dataArray.length; index++) {
          const { checked } = dataArray[index]
          if (checked === 'notApplicable') continue
          if (checked === 'true') {
            textAreaValue +=
              dataArray[index].key + ':' + dataArray[index].value + '\n'
          } else {
            textAreaValue +=
              '//' + dataArray[index].key + ':' + dataArray[index].value + '\n'
          }
        }
        this.textAreaValue = textAreaValue
      }
    } else {
      if (this.state.bulkEdit && this.textAreaValueFlag) {
        this.textAreaValueFlag = false
        for (let index = 0; index < dataArray.length; index++) {
          const { checked } = dataArray[index]
          if (checked === 'notApplicable') continue
          if (checked === 'true') {
            textAreaValue +=
              dataArray[index].key + ':' + dataArray[index].value + '\n'
          } else {
            textAreaValue +=
              '//' + dataArray[index].key + ':' + dataArray[index].value + '\n'
          }
        }
        this.textAreaValue = textAreaValue
      }
    }
  }

  render() {
    const { dataArray, original_data: originalData, title } = this.props
    if (!isDashboardRoute(this.props)) {
      for (let index = 0; index < dataArray.length; index++) {
        if (dataArray[index].key === '') {
          dataArray.splice(index, 1)
        }

        if (originalData[index].key === '') {
          originalData.splice(index, 1)
        }
      }
    }

    this.autoFillBulkEdit()
    return (
      // "generic-table-container"
      // table-bordered
      <div className='hm-public-table'>
        <div
          className={
            isDashboardRoute(this.props)
              ? 'generic-table-title-container'
              : 'public-generic-table-title-container'
          }
        >
          {!isDashboardRoute(this.props) && title}
        </div>
        {
          !this.state.bulkEdit && dataArray.length > 0
            ? (
              <table className='table' id='custom-generic-table'>
                {
                  isDashboardRoute(this.props)
                    ? (
                      <thead>
                        <tr>
                          <th className='custom-th'> </th>
                          <th className='custom-th' id='generic-table-key-cell'>
                            KEY
                          </th>
                          <th className='custom-th'>VALUE</th>
                          <th className='custom-th'>DESCRIPTION</th>
                        </tr>
                      </thead>
                    )
                    : (
                      // <colgroup>
                      //   <col style={{ width: '36px' }} />
                      //   <col style={{ width: '150px' }} />
                      //   <col style={{ width: '240px' }} />
                      //   <col />
                      // </colgroup>

                      <thead>
                        <tr>
                          <th className='custom-th'> </th>
                          <th className='custom-th' id='generic-table-key-cell'>
                            KEY
                        </th>
                          <th className='custom-th'>VALUE</th>
                          <th className='custom-th'>DESCRIPTION</th>
                        </tr>
                      </thead>
                    )
                }
                <tbody style={{ border: 'none' }}>
                  {dataArray.map((e, index) => (
                    <tr key={index} id='generic-table-row'>
                      <td
                        className='custom-td'
                        id='generic-table-key-cell'
                        style={{ marginLeft: '5px' }}
                      >
                        {
                          dataArray[index].checked === 'notApplicable'
                            ? null
                            : (
                              <input
                                disabled={
                                  isDashboardRoute(this.props) ||
                                    originalData[index].checked === 'false'
                                    ? null
                                    : 'disabled'
                                }
                                name={index + '.checkbox'}
                                value={dataArray[index].checked}
                                checked={
                                  dataArray[index].checked === 'true'
                                }
                                type='checkbox'
                                className='Checkbox'
                                onChange={this.handleChange}
                                style={{ border: 'none' }}
                              />
                            )
                        }
                      </td>
                      <td className='custom-td'>
                        {isDashboardRoute(this.props)
                          ? <input
                            name={index + '.key'}
                            value={dataArray[index].key}
                            onChange={this.handleChange}
                            type='text'
                            placeholder={
                              dataArray[index].checked === 'notApplicable'
                                ? 'Key'
                                : ''
                            }
                            className='form-control'
                            style={{ border: 'none' }}
                          />
                          : dataArray[index].key}
                      </td>
                      <td className='custom-td'>
                        <input
                          name={index + '.value'}
                          value={dataArray[index].value}
                          onChange={this.handleChange}
                          type='text'
                          placeholder={
                            dataArray[index].checked === 'notApplicable'
                              ? 'Value'
                              : `Enter ${dataArray[index].key}`
                          }
                          className='form-control'
                          style={{ border: 'none' }}
                        />
                      </td>
                      <td className='custom-td' id='generic-table-description-cell'>
                        {
                          isDashboardRoute(this.props)
                            ? (
                              <div>
                                <input
                                  disabled={
                                    isDashboardRoute(this.props) ? null : 'disabled'
                                  }
                                  name={index + '.description'}
                                  value={dataArray[index].description}
                                  onChange={this.handleChange}
                                  type='text'
                                  placeholder={
                                    dataArray[index].checked === 'notApplicable'
                                      ? 'Description'
                                      : ''
                                  }
                                  style={{ border: 'none' }}
                                  className='form-control'
                                />
                                {
                                  dataArray.length - 1 === index ||
                                    !isDashboardRoute(this.props) ||
                                    title === 'Path Variables'
                                    ? null
                                    : (
                                      <button
                                        type='button'
                                        className='btn cross-button'
                                        onClick={() =>
                                          this.handleDelete(dataArray, index, title)}
                                      >
                                        <i className='uil-trash-alt text-danger' />
                                      </button>
                                    )
                                }
                              </div>
                            )
                            : dataArray[index].description
                        }
                      </td>
                    </tr>
                  )
                  )}
                </tbody>
              </table>
            )
            : null
        }

        {
          this.state.bulkEdit &&
          (
            <div id='custom-bulk-edit'>
              <textarea
                className='form-control'
                name='contents'
                id='contents'
                rows='9'
                value={this.textAreaValue}
                onChange={this.handleBulkChange}
                placeholder={
                  'Rows are separated by new lines \n Keys and values are separated by : \n Prepend // to any row you want to add but keep disabled'
                }
              />
            </div>
          )
        }

        {title === 'Path Variables' ||
          !isDashboardRoute(this.props)
          ? null
          : (
            <div className='generic-table-title-container'>
              <button
                id='edit-button'
                className='btn btn-default custom-button'
                onClick={() => this.displayEditButton()}
              >
                {this.state.editButtonName}
              </button>
            </div>
          )}
      </div>
    )
  }
}

export default GenericTable
