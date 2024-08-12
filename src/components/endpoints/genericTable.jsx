import React, { Component } from 'react'
import { isDashboardRoute, isElectron, isDashboardAndTestingView, hexToRgb } from '../common/utility'
import { willHighlight, getHighlightsData } from './highlightChangesHelper'
import './endpoints.scss'
import shortid from 'shortid'
import _ from 'lodash'
import TextField from 'react-autocomplete-input'
import 'react-autocomplete-input/dist/bundle.css'
import { background } from '../backgroundColor.js'
import { isOnPublishedPage } from '../common/utility'
import withRouter from '../common/withRouter.jsx'
import { RiCodeLine, RiDeleteBinLine } from 'react-icons/ri'
import { Modal } from 'bootstrap'

const autoCompleterDefaultProps = {
  Component: 'input',
  autoComplete: 'off',
  trigger: ['{{']
}

class GenericTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bulkEdit: false,
      optionalParams: false,
      editButtonName: 'Bulk Edit',
      originalParams: [],
      originalHeaders: [],
      theme: ''
    }

    this.checkboxFlags = []
    this.textAreaValue = ''
    this.textAreaValueFlag = true
    this.helperflag = false
    this.count = ''
  }

  state = {
    optionalParams: false,
    randomId: ''
  }

  componentDidMount() {
    this.setState({ theme: this.props.publicCollectionTheme })
    const { dataArray, originalData } = this.props
    if (dataArray && originalData) {
      this.setState({
        dataArray: this.sortData(dataArray),
        originalData: this.sortData(originalData),
        optionalParams: false
      })
    }
    const dynamicColor = hexToRgb(this.props.publicCollectionTheme, 0.02)
    const staticColor = background['background_boxes']

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `
    }

    this.setState({
      theme: { backgroundStyle }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.params.endpointId !== prevProps.params.endpointId) {
      const randomId = shortid.generate()
      this.setState({ optionalParams: false, randomId })
    }
  }

  handleChange = (e, inpTarget = null) => {
    const target = inpTarget || e.currentTarget
    let { dataArray, title, original_data: originalData } = this.props
    dataArray = JSON.parse(JSON.stringify(dataArray))
    const name = target.name.split('.')
    const value = target.value
    if (name[1] === 'checkbox') {
      this.checkboxFlags[name[0]] = true
      if (dataArray[name[0]].checked === 'true') {
        dataArray[name[0]].checked = 'false'
      } else {
        dataArray[name[0]].checked = 'true'
      }
    }
    if (name[1] === 'key' && title !== 'Path Variables') {
      dataArray[name[0]].key = value
      if (title === 'Params' && dataArray[name[0]].key.length === 0) {
        this.handleDelete(dataArray, name[0], title)
      }
    } else if (title !== 'Path Variables' || name[1] !== 'key') {
      if (!isDashboardRoute(this.props)) {
        originalData[name[0]].empty = false
      }
      dataArray[name[0]][name[1]] = value
    }

    if (title === 'formData' && name[1] === 'type') {
      if (target.value === 'file') dataArray[name[0]].value = {}
      else dataArray[name[0]].value = ''
    }

    if (dataArray[name[0]][name[1]].length !== 0 && !this.checkboxFlags[name[0]] && title !== 'Path Variables') {
      dataArray[name[0]].checked = 'true'
    }

    if (title !== 'Path Variables') {
      this.handleAdd(dataArray, title, dataArray[name[0]][name[1]], name[0])
    }

    if (title === 'Headers' || title === 'Params' || title === 'Path Variables') {
      this.props.props_from_parent(title, dataArray)
    }
    if (title === 'formData' || title === 'x-www-form-urlencoded') {
      this.props.handle_change_body_data(title, dataArray)
    }
  }

  handleBulkChange = (e) => {
    const { title, dataArray: propsDataArray } = this.props
    const dataArray = []
    const dataArrayOfFileType = _.filter(propsDataArray, { type: 'file' })
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
      } else if (key.substring(0, 2) === '//' && key.length === 2 && value.length === 0) {
        continue
      } else if (key.substring(0, 2) === '//' && key.length === 2 && value.length !== 0) {
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
    if (title === 'Params' || title === 'Headers') {
      this.props.props_from_parent(title, dataArray)
    }
    if (title === 'formData' || title === 'x-www-form-urlencoded') {
      this.props.handle_change_body_data(title, [...dataArrayOfFileType, ...dataArray])
    }
  }

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
      if (title === 'Params') this.props.props_from_parent('handleAddParam', dataArray)
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
    this.checkboxFlags[index] = undefined
    if (title === 'Headers' || title === 'Params') {
      this.props.props_from_parent(title, dataArray)
    }
    if (title === 'formData' || title === 'x-www-form-urlencoded') {
      this.props.handle_change_body_data(title, dataArray)
    }
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
      if ((this.state.bulkEdit && this.textAreaValueFlag) || this.count !== count) {
        this.count = count
        this.textAreaValueFlag = false
        for (let index = 0; index < dataArray.length; index++) {
          const { checked, type } = dataArray[index]
          if (checked === 'notApplicable') continue
          if (type === 'file') continue
          if (checked === 'true') {
            textAreaValue += dataArray[index].key + ':' + dataArray[index].value + '\n'
          } else {
            textAreaValue += '//' + dataArray[index].key + ':' + dataArray[index].value + '\n'
          }
        }
        this.textAreaValue = textAreaValue
      }
    } else {
      if (this.state.bulkEdit && this.textAreaValueFlag) {
        this.textAreaValueFlag = false
        for (let index = 0; index < dataArray.length; index++) {
          const { checked, type } = dataArray[index]
          if (checked === 'notApplicable') continue
          if (type === 'file') continue
          if (checked === 'true') {
            textAreaValue += dataArray[index].key + ':' + dataArray[index].value + '\n'
          } else {
            textAreaValue += '//' + dataArray[index].key + ':' + dataArray[index].value + '\n'
          }
        }
        this.textAreaValue = textAreaValue
      }
    }
  }

  toggleOptionalParams() {
    const optionalParams = !this.state.optionalParams
    this.setState({ optionalParams })
  }

  findUncheckedEntityCount() {
    const { dataArray } = this.props
    let count = 0
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i].checked === 'false') {
        count += 1
      }
    }
    return count
  }

  renderPublicTableRow(dataArray, index, originalData, title) {
    const currentItem = dataArray[index]
    const originalItem = originalData[index]
    const isChecked = currentItem.checked === 'true'
    const isNotApplicable = currentItem.checked === 'notApplicable'
    const isDisabled = originalItem.checked !== 'false'
    const isEmpty = originalItem.empty

    return (
      <tr key={currentItem.key} id='generic-table-row' className={getHighlightsData(this.props, title, [currentItem.key]) ? 'active' : ''}>
        <td className='custom-td' id='generic-table-key-cell'>
          {isNotApplicable ? null : (
            <label className='customCheckbox'>
              <input
                disabled={isDisabled}
                name={`${index}.checkbox`}
                value={currentItem.checked}
                checked={isChecked}
                type='checkbox'
                aria-label="checkbox"
                className='Checkbox'
                onChange={this.handleChange}
              />
              <span
                className='checkmark'
                style={{ backgroundColor: this.props.publicCollectionTheme, borderColor: this.props.publicCollectionTheme }}
              />
            </label>
          )}
        </td>
        <td className='custom-td keyWrapper'>
          {currentItem.key}
          <p className='text-muted small'>{isChecked || isNotApplicable ? '' : '(Optional)'}</p>
        </td>
        <td className='custom-td valueWrapper'>
          <div className='d-flex align-items-center'>
            <input
              name={`${index}.value`}
              value={currentItem.type === 'file' ? '' : currentItem.value}
              key={`${index}${this.state.randomId}`}
              onChange={this.handleChange}
              type='text'
              placeholder={`Enter ${currentItem.key}`}
              className={`form-control ${isEmpty ? 'empty-params' : ''}`}
            />
            {isEmpty && <div className='small mandatory-field-text'>*This field is mandatory</div>}
          </div>
          {currentItem.description && <p className='small text-muted'>{`Description: ${currentItem.description}`}</p>}
        </td>
      </tr>
    )
  }

  renderTextOrFileInput(dataArray, index) {
    const { title } = this.props
    const key = `${index}.key`
    return (
      <div className='position-relative fileInput'>
        <TextField
          {...autoCompleterDefaultProps}
          name={key}
          key={key}
          value={dataArray[index].key}
          onChange={(e) => this.handleChange(e, { name: key, value: e })}
          type='text'
          placeholder='Key'
          className='form-control'
          options={{ '{{': _.keys(this.props.environment.variables) }}
        />
        {title === 'formData' && (
          <select
            className='transition cursor-pointer'
            name={index + '.type'}
            value='text'
            onChange={(e) => {
              this.handleChange(e)
            }}
          >
            <option value='text'>Text</option>
            <option value='file'>File</option>
          </select>
        )}
      </div>
    )
  }

  getName(name) {
    return name.split('\\')[name.split('\\').length - 1]
  }

  handleFileInput(dataArray, index) {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote
      const files = dialog.showOpenDialogSync({
        properties: ['openFile']
      })
      if (files) {
        const id = shortid.generate()
        this.handleChange({
          currentTarget: {
            name: index + '.value',
            value: {
              id,
              name: this.getName(files[0]),
              srcPath: files[0]
            }
          }
        })
      }
    } else {
      const data = <h5 className='text-center'>File upload feature is not supported on Web</h5>
      this.props.open_modal('DESKTOP_APP_DOWNLOAD', data)
      this.handleChange({
        currentTarget: {
          name: index + '.type',
          value: 'text'
        }
      })
    }
  }


  renderTableRow(dataArray, index, originalData, title) {
    const valueKey = `${index}.value`
    return (
      <tr key={index} id='generic-table-row'>
        <td className='custom-td' id='generic-table-key-cell' style={{ marginLeft: '5px' }}>
          {dataArray[index].checked === 'notApplicable' ? null : (
            <label className='customCheckbox'>
              <input
                disabled={
                  isDashboardRoute(this.props, true) || originalData[index].checked === 'false' || originalData[index].type != 'enable'
                    ? null
                    : 'disabled'
                }
                name={index + '.checkbox'}
                value={dataArray[index].checked}
                checked={dataArray[index].checked === 'true'}
                type='checkbox'
                aria-label="checkbox"
                className='Checkbox'
                onChange={this.handleChange}
              />
              <span className='checkmark' />
            </label>
          )}
        </td>
        <td className='custom-td' style={{ width: '435px' }}>
          {isDashboardRoute(this.props) ? this.renderTextOrFileInput(dataArray, index) : dataArray[index].key}
        </td>
        <td className='custom-td' style={{ width: '435px' }}>
          {dataArray[index].type === 'file' ? (
            this.renderSelectFiles(dataArray, index)
          ) : (
            <div className='position-relative'>
              <TextField
                {...autoCompleterDefaultProps}
                name={valueKey}
                key={valueKey}
                value={dataArray[index].type !== 'file' ? dataArray[index].value : ''}
                onChange={(e) => this.handleChange(e, { name: valueKey, value: e })}
                className='form-control'
                placeholder={dataArray[index].checked === 'notApplicable' ? 'Value' : `Enter ${dataArray[index].key}`}
                options={{ '{{': _.keys(this.props.environment.variables) }}
                type={dataArray[index].type}
              />
            </div>
          )}
        </td>
        <td className='custom-td' style={{ width: '435px' }} id='generic-table-description-cell'>
          {isDashboardRoute(this.props) ? (
            <div>
              {/* params description is rendered here */}
              <input
                disabled={isDashboardRoute(this.props) ? null : 'disabled'}
                name={index + '.description'}
                value={dataArray[index].description}
                onChange={this.handleChange}
                type='text'
                placeholder='Description'
                className='form-control'
              />
            </div>
          ) : (
            dataArray[index].description
          )}
        </td>

        {isDashboardRoute(this.props) ? (
          <div className='delete-icons'>
            {dataArray.length - 1 === index || !isDashboardRoute(this.props) || title === 'Path Variables' ? null : (
              <button type='button' className='btn pl-2 pt-1 pr-0 cross-button' onClick={() => this.handleDelete(dataArray, index, title)}>
                <RiDeleteBinLine size={20} className='text-link' />
              </button>
            )}
          </div>
        ) : (
          dataArray[index].description
        )}
      </tr>
    )
  }

  renderSelectFiles(dataArray, index) {
    if (isElectron()) {
      const { app } = window.require('electron').remote
      const value = dataArray[index].value
      const FILE_UPLOAD_DIRECTORY = app.getPath('userData') + '/fileUploads/'
      const destPath = FILE_UPLOAD_DIRECTORY + value.id + '_' + value.name
      const fs = window.require('fs')
      const srcExist = fs.existsSync(value.srcPath)
      const desExist = value.id ? fs.existsSync(destPath) : false
      let name = ''
      if (srcExist) name = value.name
      if (!srcExist && desExist) name = value.id + '_' + value.name
      if (name) {
        return (
          <div className='fileName selectFile d-flex align-items-center justify-content-between'>
            {' '}
            <span className='truncate'>{name}</span>
            <button
              className='align-items-center d-flex ml-2'
              onClick={() => {
                this.handleDeSelectFile(index)
              }}
            >
              &times;
            </button>
          </div>
        )
      }
    }
    return (
      <div className='selectFile d-flex align-items-center'>
        <button onClick={() => this.handleFileInput(dataArray, index)}>Select file</button>
      </div>
    )
  }

  handleDeSelectFile(index) {
    this.handleChange({ currentTarget: { name: `${index}.value`, value: {} } })
  }

  renderOptionalParamsButton() {
    return !isDashboardRoute(this.props) && this.findUncheckedEntityCount() ? (
      <div className='viewOptionals' onClick={() => this.toggleOptionalParams()} style={{ color: this.state.theme }}>
        {!this.state.optionalParams
          ? `View Optional ${this.renderTitle(this.props.title)}`
          : `Hide Optional ${this.renderTitle(this.props.title)}`}
      </div>
    ) : null
  }

  renderTitle(title) {
    if (title === 'Params') {
      return 'Query Params'
    } else if (title === 'formData') {
      return 'form-data'
    } else {
      return title
    }
  }

  renderPublicTableHeadings() {
    return (
      <thead>
        <tr>
          <th className='custom-th' />
          <th className='custom-th' id='generic-table-key-cell'>
            NAME
          </th>
          <th className='custom-th'>VALUE</th>
        </tr>
      </thead>
    )
  }

  sortData(data) {
    const priority = {
      true: 1,
      false: 2,
      notApplicable: 3
    }
    return data.sort((itemA, itemB) => {
      return priority[itemA.checked] - priority[itemB.checked]
    })
  }

  render() {
    const { dataArray, original_data: originalData, title } = this.props
    if (!isDashboardRoute(this.props)) {
      for (let index = 0; index < dataArray.length; index++) {
        if (dataArray[index].key === '') {
          dataArray.splice(index, 1)
        }
      }
    }
    const isDocView = !isDashboardRoute(this.props) || !isDashboardAndTestingView(this.props, this.props.currentView)
    this.autoFillBulkEdit()
    return (
      <div className='hm-public-table position-relative mb-2'>
        {title === 'Path Variables' && isDashboardAndTestingView(this.props, this.props.currentView) ? <div className='fs-4'>{title}</div> : null}

        {!this.state.bulkEdit && dataArray.length > 0 ? (
          <div className={`headParaWraper p-0`} style={this.state.theme.backgroundStyle}>
            <table className='table' id='custom-generic-table'>
              {isDashboardRoute(this.props) ? (
                <thead>
                  <tr>
                    <th className='custom-th'> </th>
                    <th className='custom-th text-gray' id='generic-table-key-cell dd'>
                      KEY
                    </th>
                    <th className='custom-th text-gray'>VALUE</th>
                    <th className='custom-th text-gray'>DESCRIPTION</th>
                  </tr>
                </thead>
              ) : dataArray.length === this.findUncheckedEntityCount() ? (
                this.state.optionalParams ? (
                  this.renderPublicTableHeadings()
                ) : null
              ) : (
                this.renderPublicTableHeadings()
              )}

              <tbody style={{ border: 'none' }}>
                {dataArray.map((e, index) =>
                  !isDashboardRoute(this.props)
                    ? (dataArray[index]?.checked === 'true' ||
                      dataArray[index]?.checked === 'notApplicable' ||
                      this.state.optionalParams) &&
                    this.renderPublicTableRow(dataArray, index, originalData, title)
                    : this.renderTableRow(dataArray, index, originalData, title)
                )}
              </tbody>
            </table>
          </div>
        ) : null}
        {this.renderOptionalParamsButton()}

        {this.state.bulkEdit && (
          <div id='custom-bulk-edit' className='form-group m-0 bulkEdit'>
            <textarea
              className='form-control'
              name='contents'
              id='contents'
              rows='9'
              value={this.textAreaValue}
              onChange={this.handleBulkChange}
              placeholder={
                'Rows are separated by new lines \\nKeys and values are separated by : \\nPrepend // to any row you want to add but keep disabled'
              }
            />
          </div>
        )}

        {title === 'Path Variables' || !isDashboardRoute(this.props) ? null : (
          <div className='generic-table-title-container'>
            <button className='adddescLink mt-2 addBulk icon-button px-2' onClick={() => this.displayEditButton()}>
              {this.state.editButtonName}
            </button>
          </div>
        )}
      </div>
    )
  }
}

export default withRouter(GenericTable)
