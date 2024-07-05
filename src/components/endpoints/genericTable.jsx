import React, { useState, useEffect } from 'react'
import { isDashboardRoute, isElectron, isDashboardAndTestingView, hexToRgb } from '../common/utility'
import { willHighlight, getHighlightsData } from './highlightChangesHelper'
import './endpoints.scss'
import shortid from 'shortid'
import _ from 'lodash'
import TextField from 'react-autocomplete-input'
import 'react-autocomplete-input/dist/bundle.css'
import { background } from '../backgroundColor.js'

const autoCompleterDefaultProps = {
  Component: 'input',
  autoComplete: 'off',
  trigger: ['{{']
}

const GenericTable = (props) => {
  const [bulkEdit, setBulkEdit] = useState(false);
  const [optionalParams, setOptionalParams] = useState(false);
  const [editButtonName, setEditButtonName] = useState('Bulk Edit');
  const [theme, setTheme] = useState('');
  const [randomId, setRandomId] = useState('');

  let checkboxFlags = [];
  let textAreaValue = '';
  let textAreaValueFlag = true;
  let helperflag = false;
  let _count = '';

  useEffect(() => {
    setTheme(props.publicCollectionTheme);
    const { dataArray, originalData } = props;
    if (dataArray && originalData) {
      setOptionalParams(false);
    }

    const dynamicColor = hexToRgb(props.publicCollectionTheme, 0.02);
    const staticColor = background['backgroound_boxes'];

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `,
    };

    setTheme(backgroundStyle);
  }, [props.publicCollectionTheme, props.dataArray, props.originalData]);

  useEffect(() => {
    const randomId = shortid.generate();
    setRandomId(randomId);
    setOptionalParams(false);
  }, [props.match.params.endpointId]);

  const handleChange = (e, inpTarget = null) => {
    const target = inpTarget || e.currentTarget
    let { dataArray, title, original_data: originalData } = props
    dataArray = JSON.parse(JSON.stringify(dataArray))
    const name = target.name.split('.')
    const value = target.value
    if (name[1] === 'checkbox') {
      checkboxFlags[name[0]] = true
      if (dataArray[name[0]].checked === 'true') {
        dataArray[name[0]].checked = 'false'
      } else {
        dataArray[name[0]].checked = 'true'
      }
    }
    if (name[1] === 'key' && title !== 'Path Variables') {
      dataArray[name[0]].key = value
      if (title === 'Params' && dataArray[name[0]].key.length === 0) {
        handleDelete(dataArray, name[0], title)
      }
    } else if (title !== 'Path Variables' || name[1] !== 'key') {
      if (!isDashboardRoute(props)) {
        originalData[name[0]].empty = false
      }
      dataArray[name[0]][name[1]] = value
    }

    if (title === 'formData' && name[1] === 'type') {
      if (target.value === 'file') dataArray[name[0]].value = {}
      else dataArray[name[0]].value = ''
    }

    if (dataArray[name[0]][name[1]].length !== 0 && !checkboxFlags[name[0]] && title !== 'Path Variables') {
      dataArray[name[0]].checked = 'true'
    }

    if (title !== 'Path Variables') {
      handleAdd(dataArray, title, dataArray[name[0]][name[1]], name[0])
    }

    if (title === 'Headers' || title === 'Params' || title === 'Path Variables') {
      props.props_from_parent(title, dataArray)
    }
    if (title === 'formData' || title === 'x-www-form-urlencoded') {
      props.handle_change_body_data(title, dataArray)
    }
  }

  const handleBulkChange = (e) => {
    const { title, dataArray: propsDataArray } = props
    const dataArray = []
    const dataArrayOfFileType = _.filter(propsDataArray, { type: 'file' })
    textAreaValue = e.currentTarget.value
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
      props.props_from_parent(title, dataArray)
    }
    if (title === 'formData' || title === 'x-www-form-urlencoded') {
      props.handle_change_body_data(title, [...dataArrayOfFileType, ...dataArray])
    }
  }

  const handleAdd = (dataArray, title, key, index) => {
    index = parseInt(index) + 1
    if (key.length >= 1 && !dataArray[index]) {
      const len = dataArray.length
      dataArray[len.toString()] = {
        checked: 'notApplicable',
        key: '',
        value: '',
        description: ''
      }
      if (title === 'Headers') props.props_from_parent(title, dataArray)
      if (title === 'Params') props.props_from_parent('handleAddParam', dataArray)
    }
  }

  const handleDelete = (dataArray, index, title) => {
    const newDataArray = []
    for (let i = 0; i < dataArray.length; i++) {
      if (i === index) {
        continue
      }
      newDataArray.push(dataArray[i])
    }
    dataArray = newDataArray
    checkboxFlags[index] = undefined
    if (title === 'Headers' || title === 'Params') {
      props.props_from_parent(title, dataArray)
    }
    if (title === 'formData' || title === 'x-www-form-urlencoded') {
      props.handle_change_body_data(title, dataArray)
    }
  }

  const displayEditButton = () => {
    if (bulkEdit) {
      setBulkEdit(false);
      setEditButtonName('Bulk Edit');
    } else {
      if (!helperflag && textAreaValueFlag) {
        helperflag = true
      } else {
        textAreaValueFlag = true
      }
      setBulkEdit(true);
      setEditButtonName('Key-Value Edit');
    }
  }

  const autoFillBulkEdit = () => {
    let text_area_value = ''
    const { dataArray, count } = props
    if (count) {
      if ((bulkEdit && textAreaValueFlag) || _count !== count) {
        _count = count
        textAreaValueFlag = false
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
        textAreaValue = text_area_value
      }
    } else {
      if (bulkEdit && textAreaValueFlag) {
        textAreaValueFlag = false
        for (let index = 0; index < dataArray.length; index++) {
          const { checked, type } = dataArray[index]
          if (checked === 'notApplicable') continue
          if (type === 'file') continue
          if (checked === 'true') {
            text_area_value += dataArray[index].key + ':' + dataArray[index].value + '\n'
          } else {
            text_area_value += '//' + dataArray[index].key + ':' + dataArray[index].value + '\n'
          }
        }
        textAreaValue = text_area_value
      }
    }
  }

  const toggleOptionalParams = () => {
    setOptionalParams(!optionalParams)
  }

  const findUncheckedEntityCount = () => {
    const { dataArray } = props
    let count = 0
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i].checked === 'false') {
        count += 1
      }
    }
    return count
  }

  const renderPublicTableRow = (dataArray, index, originalData, title) => {
    const currentItem = dataArray[index];
    const originalItem = originalData[index];
    const isChecked = currentItem.checked === 'true';
    const isNotApplicable = currentItem.checked === 'notApplicable';
    const isDisabled = originalItem.checked !== 'false';
    const isEmpty = originalItem.empty;

    return (
      <tr key={currentItem.key} id='generic-table-row' className={getHighlightsData(props, title, [currentItem.key]) ? 'active' : ''}>
        <td className='custom-td' id='generic-table-key-cell'>
          {isNotApplicable ? null : (
            <label className='customCheckbox'>
              <input
                disabled={isDisabled}
                name={`${index}.checkbox`}
                value={currentItem.checked}
                checked={isChecked}
                type='checkbox'
                className='Checkbox'
                onChange={handleChange}
              />
              <span className='checkmark' style={{ backgroundColor: props.publicCollectionTheme, borderColor: props.publicCollectionTheme }} />
            </label>
          )}
        </td>
        <td className='custom-td keyWrapper'>
          {currentItem.key}
          <p className='text-muted small'>
            {isChecked || isNotApplicable ? '' : '(Optional)'}
          </p>
        </td>
        <td className='custom-td valueWrapper'>
          <div className='d-flex align-items-center'>
            <input
              name={`${index}.value`}
              value={currentItem.type === 'file' ? '' : currentItem.value}
              key={`${index}${randomId}`}
              onChange={handleChange}
              type='text'
              placeholder={`Enter ${currentItem.key}`}
              className={`form-control ${isEmpty ? 'empty-params' : ''}`}
            />
            {isEmpty && <div className='small mandatory-field-text'>*This field is mandatory</div>}
          </div>
          {currentItem.description && (
            <p className='small text-muted'>{`Description: ${currentItem.description}`}</p>
          )}
        </td>
      </tr>
    );
  }

  const renderTextOrFileInput = (dataArray, index) => {
    const { title } = props
    const key = `${index}.key`
    return (
      <div className='position-relative fileInput'>
        <TextField
          {...autoCompleterDefaultProps}
          name={key}
          key={key}
          value={dataArray[index].key}
          onChange={(e) => handleChange(e, { name: key, value: e })}
          type='text'
          placeholder='Key'
          className='form-control'
          disabled={dataArray[index]?.type === 'disable' ? true : false}
          options={{ '{{': _.keys(props.environment.variables) }}
        />
        {title === 'formData' && (
          <select
            className='transition cursor-pointer'
            name={index + '.type'}
            value='text'
            onChange={(e) => {
              handleChange(e)
            }}
          >
            <option value='text'>Text</option>
            <option value='file'>File</option>
          </select>
        )}
      </div>
    )
  }

  const getName = (name) => {
    return name.split('\\')[name.split('\\').length - 1]
  }

  const handleFileInput = (dataArray, index) => {
    if (isElectron()) {
      const { dialog } = window.require('electron').remote
      const files = dialog.showOpenDialogSync({
        properties: ['openFile']
      })
      if (files) {
        const id = shortid.generate()
        handleChange({
          currentTarget: {
            name: index + '.value',
            value: {
              id,
              name: getName(files[0]),
              srcPath: files[0]
            }
          }
        })
      }
    } else {
      const data = <h5 className='text-center'>File upload feature is not supported on Web</h5>
      props.open_modal('DESKTOP_APP_DOWNLOAD', data)
      handleChange({
        currentTarget: {
          name: index + '.type',
          value: 'text'
        }
      })
    }
  }

  const renderTableRow = (dataArray, index, originalData, title) => {
    const valueKey = `${index}.value`
    return (
      <tr key={index} id='generic-table-row'>
        <td className='custom-td' id='generic-table-key-cell' style={{ marginLeft: '5px' }}>
          {dataArray[index].checked === 'notApplicable' ? null : (
            <label className='customCheckbox'>
              <input
                disabled={isDashboardRoute(props, true) || originalData[index].checked === 'false' || originalData[index].type != 'enable' ? null : 'disabled'}
                name={index + '.checkbox'}
                value={dataArray[index].checked}
                checked={dataArray[index].checked === 'true'}
                type='checkbox'
                className='Checkbox'
                onChange={handleChange}
              />
              <span className='checkmark' />
            </label>
          )}
        </td>
        <td className='custom-td' style={{ width: '200px' }}>
          {isDashboardRoute(props) ? renderTextOrFileInput(dataArray, index) : dataArray[index].key}
        </td>
        <td className='custom-td'>
          {dataArray[index].type === 'file' ? (
            renderSelectFiles(dataArray, index)
          ) : (
            <div className='position-relative'>
              <TextField
                {...autoCompleterDefaultProps}
                name={valueKey}
                key={valueKey}
                value={dataArray[index].type !== 'file' ? dataArray[index].value : ''}
                onChange={(e) => handleChange(e, { name: valueKey, value: e })}
                className='form-control'
                placeholder={dataArray[index].checked === 'notApplicable' ? 'Value' : `Enter ${dataArray[index].key}`}
                disabled={dataArray[index]?.type === 'disable' ? true : false}
                options={{ '{{': _.keys(props.environment.variables) }}
                type={dataArray[index].type}
              />
            </div>
          )}
        </td>
        <td className='custom-td' id='generic-table-description-cell'>
          {isDashboardRoute(props) ? (
            <div>
              {/* params description is rendered here */}
              <input
                disabled={isDashboardRoute(props) ? null : 'disabled'}
                name={index + '.description'}
                value={dataArray[index].description}
                onChange={handleChange}
                type='text'
                placeholder='Description'
                className='form-control'
              />
            </div>
          ) : (
            dataArray[index].description
          )}
        </td>

        <td>
          {isDashboardRoute(props) ? (
            <div>
              {dataArray.length - 1 === index || !isDashboardRoute(props) || title === 'Path Variables' ? null : (
                <button type='button' className='btn cross-button' onClick={() => handleDelete(dataArray, index, title)}>
                  <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    <path
                      d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z'
                      stroke='#E98A36'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path d='M7.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    <path d='M10.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            dataArray[index].description
          )}
        </td>
      </tr>
    )
  }

  const renderSelectFiles = (dataArray, index) => {
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
                handleDeSelectFile(index)
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
        <button onClick={() => handleFileInput(dataArray, index)}>Select file</button>
      </div>
    )
  }

  const handleDeSelectFile = (index) => {
    handleChange({ currentTarget: { name: `${index}.value`, value: {} } })
  }

  const renderOptionalParamsButton = () => {
    return !isDashboardRoute(props) && findUncheckedEntityCount() ? (
      <div className='viewOptionals' onClick={() => toggleOptionalParams()} style={{ color: theme }}>
        {!optionalParams
          ? `View Optional ${renderTitle(props.title)}`
          : `Hide Optional ${renderTitle(props.title)}`}
      </div>
    ) : null
  }

  const renderTitle = (title) => {
    if (title === 'Params') {
      return 'Query Params'
    } else if (title === 'formData') {
      return 'form-data'
    } else {
      return title
    }
  }

  const renderPublicTableHeadings = () => {
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
  const { dataArray, original_data: originalData, title } = props
  if (!isDashboardRoute(props)) {
    for (let index = 0; index < dataArray.length; index++) {
      if (dataArray[index].key === '') {
        dataArray.splice(index, 1)
      }
    }
  }
  const isDocView = !isDashboardRoute(props) || !isDashboardAndTestingView(props, props.currentView)
  autoFillBulkEdit()
  return (
    // "generic-table-container"
    // table-bordered
    <div className='hm-public-table position-relative mb-2'>
      {title === 'Path Variables' && isDashboardAndTestingView(props, props.currentView) ? <div>{title}</div> : null}
      <div className={isDocView ? 'public-generic-table-title-container mb-2' : 'generic-table-title-container'}>
        {isDocView && dataArray.length > 0 ? (
          <span>
            {renderTitle(title)} {willHighlight(props, title) ? <i className='fas fa-circle' /> : null}
          </span>
        ) : null}
      </div>

      {!bulkEdit && dataArray.length > 0 ? (
        <div className='headParaWraper' style={theme.backgroundStyle}>
          <table className='table' id='custom-generic-table'>
            {isDashboardRoute(props) ? (
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
            ) : dataArray.length === findUncheckedEntityCount() ? (
              optionalParams ? (
                renderPublicTableHeadings()
              ) : null
            ) : (
              renderPublicTableHeadings()
            )}

            <tbody style={{ border: 'none' }}>
              {dataArray.map((e, index) =>
                !isDashboardRoute(props)
                  ? (dataArray[index]?.checked === 'true' ||
                    dataArray[index]?.checked === 'notApplicable' ||
                    optionalParams) &&
                  renderPublicTableRow(dataArray, index, originalData, title)
                  : renderTableRow(dataArray, index, originalData, title)
              )}
            </tbody>
          </table>
        </div>
      ) : null}
      {renderOptionalParamsButton()}

      {bulkEdit && (
        <div id='custom-bulk-edit' className='form-group m-0 bulkEdit'>
          <textarea
            className='form-control'
            name='contents'
            id='contents'
            rows='9'
            value={textAreaValue}
            onChange={handleBulkChange}
            placeholder={
              'Rows are separated by new lines \\nKeys and values are separated by : \\nPrepend // to any row you want to add but keep disabled'
            }
          />
        </div>
      )}

      {title === 'Path Variables' || !isDashboardRoute(props) ? null : (
        <div className='generic-table-title-container'>
          <button className='adddescLink mt-2 addBulk' onClick={() => displayEditButton()}>
            {editButtonName}
          </button>
        </div>
      )}
    </div>
  )

}

export default GenericTable
