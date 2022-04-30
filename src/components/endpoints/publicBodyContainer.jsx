import 'ace-builds'
import React, { Component } from 'react'
import GenericTable from './genericTable'
import jQuery from 'jquery'
import AceEditor from 'react-ace'
import { willHighlight } from './highlightChangesHelper'
import './publicEndpoint.scss'
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'

class PublicBodyContainer extends Component {
  state = {
    showBodyCodeEditor: true
  };

  handleChangeBody (title, dataArray) {
    switch (title) {
      case 'formData':
        this.props.set_body('multipart/form-data', dataArray)
        break
      case 'x-www-form-urlencoded':
        this.props.set_body('application/x-www-form-urlencoded', dataArray)
        break
      default:
        break
    }
  }

  generateBodyFromDescription (bodyDescription, body) {
    if (!body) {
      body = {}
    }
    const keys = Object.keys(bodyDescription)
    for (let i = 0; i < keys.length; i++) {
      switch (bodyDescription[keys[i]].type) {
        case 'string':
        case 'number':
        case 'boolean':
          body[keys[i]] = bodyDescription[keys[i]].value
          break
        case 'array':
          body[keys[i]] = this.generateBodyFromDescription(
            bodyDescription[keys[i]].value,
            []
          )
          break
        case 'object':
          body[keys[i]] = this.generateBodyFromDescription(
            bodyDescription[keys[i]].value,
            {}
          )
          break
        default:
          break
      }
    }
    return body
  }

  makeParentKeysArray (name) {
    const parentKeyArray = name.split('.')
    parentKeyArray.splice(0, 1)
    return parentKeyArray
  }

  setBody (data) {
    this.props.set_body_description(data.bodyDescription)
    this.props.set_public_body(data.body)
  }

  handleAddDelete (pkeys, bodyDescription, body, title) {
    if (pkeys.length === 1) {
      if (title === 'delete') {
        body.splice(pkeys[0], 1)
        bodyDescription.splice(pkeys[0], 1)
      } else if (title === 'add') {
        const defaultValue = jQuery.extend(
          true,
          {},
          bodyDescription[pkeys[0]].default
        )

        bodyDescription[pkeys[0]].value.push(defaultValue)

        if (defaultValue.type === 'object') {
          const data = {}
          Object.keys(defaultValue.value).forEach((key) => {
            data[key] = defaultValue.value[key].value
          })
          body[pkeys[0]].push(data)
        } else {
          body[pkeys[0]].push(defaultValue.value)
        }
      }
    } else {
      const data = bodyDescription[pkeys[0]].value
      const bodyData = body[pkeys[0]]
      this.handleAddDelete(pkeys.slice(1, pkeys.length), data, bodyData, title)
    }

    return { body, bodyDescription }
  }

  handleDelete (name) {
    const body = JSON.parse(this.props.body.value)

    const data = this.handleAddDelete(
      this.makeParentKeysArray(name),
      jQuery.extend(true, {}, this.bodyDescription),
      jQuery.extend(true, {}, body),
      'delete'
    )

    this.setBody(data)
  }

  handleAdd (name) {
    const body = JSON.parse(this.props.body.value)

    const data = this.handleAddDelete(
      this.makeParentKeysArray(name),
      jQuery.extend(true, {}, this.bodyDescription),
      jQuery.extend(true, {}, body),
      'add'
    )

    this.setBody(data)
  }

  performChange (pkeys, bodyDescription, body, newValue) {
    if (pkeys.length === 1) {
      const type = bodyDescription[pkeys[0]].type

      if (type === 'number') {
        bodyDescription[pkeys[0]].value = parseInt(newValue)
        body[pkeys[0]] = parseInt(newValue)
      } else if (type === 'string') {
        bodyDescription[pkeys[0]].value = newValue
        body[pkeys[0]] = newValue
      } else if (type === 'boolean') {
        const value =
          newValue === 'true' ? true : newValue === 'false' ? false : null
        bodyDescription[pkeys[0]].value = value
        body[pkeys[0]] = value
      }
    } else {
      const data = bodyDescription[pkeys[0]].value
      const bodyData = body[pkeys[0]]

      this.performChange(
        pkeys.slice(1, pkeys.length),
        data,
        bodyData,
        newValue
      )
    }
    return { body, bodyDescription }
  }

  handleChange = (e) => {
    const { name, value } = e.currentTarget
    const body = JSON.parse(this.props.body.value)

    const data = this.performChange(
      this.makeParentKeysArray(name),
      jQuery.extend(true, {}, this.bodyDescription),
      jQuery.extend(true, {}, body),
      value
    )

    this.setBody(data)
  };

  handleChangeBodyDescription = (data) => {
    try {
      const body = data
      const bodyData = {
        bodyDescription: this.bodyDescription,
        body: body
      }
      this.setBody(bodyData)
    } catch (e) { }
  };

  displayAddButton (name) {
    return (
      <div className='array-row-add-wrapper'>
        <span
          className='badge badge-success'
          style={{ cursor: 'pointer' }}
          onClick={() => this.handleAdd(name)}
        >
          Add+
        </span>
      </div>
    )
  }

  displayBoolean (obj, name, className) {
    return (
      <div className='value-description-input-wrapper'>
        <select
          className={className || 'custom-boolean'}
          value={obj.value}
          onChange={this.handleChange}
          name={name}
        >
          <option value={null} />
          <option value>true</option>
          <option value={false}>false</option>
        </select>
        <label
          className='description-input-field'
          value={obj.description}
          name={name + '.description'}
          type='text'
          disabled
          placeholder='Description'
          onChange={this.handleDescriptionChange}
        />
      </div>
    )
  }

  displayInput (obj, name) {
    return (
      <div className='value-description-input-wrapper'>
        <input
          className='value-input-field'
          type={obj.type}
          name={name}
          value={obj.value}
          placeholder='Value'
          onChange={this.handleChange}
        />
        <label
          className='description-input-field'
        // value={obj.description}
        // name={name + ".description"}
        // type="text"
        // placeholder="Description"
        // onChange={this.handleDescriptionChange}
        // disabled
        >
          {obj.description}
        </label>
      </div>
    )
  }

  displayArray (array, name, defaultValue) {
    return (
      <div
        className={
          defaultValue &&
            (defaultValue.type === 'object' || defaultValue.type === 'array')
            ? 'array-wrapper'
            : 'array-without-key'
        }
      >
        {array.map((value, index) => (
          <div key={index} className='array-row'>
            {value.type === 'boolean'
              ? this.displayBoolean(value, name + '.' + index)
              : value.type === 'object'
                ? this.displayObject(value.value, name + '.' + index)
                : value.type === 'array'
                  ? this.displayArray(
                      value.value,
                      name + '.' + index,
                      value.default
                    )
                  : this.displayInput(value, name + '.' + index)}
            <button
              type='button'
              className='btn cross-button'
              onClick={() => this.handleDelete(name + '.' + index)}
            >
              <i className='fas fa-times' />
            </button>
          </div>
        ))}
        {this.displayAddButton(name)}
      </div>
    )
  }

  displayObject (obj, name) {
    return (
      <div className='object-container'>
        {Object.keys(obj).map((key, index) => (
          <div
            key={key}
            className={
              obj[key].type === 'array'
                ? 'array-container'
                : 'object-row-wrapper'
            }
            style={
              obj[key].type === 'object'
                ? { flexDirection: 'column' }
                : { flexDirection: 'row' }
            }
          >
            <div className='key-title'>
              <label>{key}</label>
              <label className='data-type'>{obj[key].type}</label>
            </div>
            {obj[key].type === 'object'
              ? this.displayObject(obj[key].value, name + '.' + key)
              : obj[key].type === 'array'
                ? this.displayArray(
                    obj[key].value,
                    name + '.' + key,
                    obj[key].default
                  )
                : obj[key].type === 'boolean'
                  ? this.displayBoolean(obj[key], name + '.' + key)
                  : this.displayInput(obj[key], name + '.' + key)}
          </div>
        ))}
      </div>
    )
  }

  makeJson (body) {
    try {
      const parsedBody = JSON.stringify(JSON.parse(body), null, 2)
      return parsedBody
    } catch (e) {
      return body
    }
  }

  displayBodyDecription (parentPath = '', object) {
    if (!object) {
      return null
    }
    const displayLegend = () => {
      const types = ['string', 'number', 'boolean', 'array', 'object']
      return (
        <div className='d-flex flex-row-reverse'>
          {
          types.map((type, index) => (
            <small key={index} className='ml-3 text-small'><Badge className={`body-desc-type ${type}`}>{type.charAt(0)}</Badge> <span className='text-capitalize'>{type}</span></small>
          ))
        }
        </div>
      )
    }

    const renderType = (type) => {
      return <Badge className={`body-desc-type ${type}`} style={{ cursor: 'default' }}>{type.charAt(0)}</Badge>
    }

    const renderObject = (parentPath, object) => {
      if (!object) return null
      if (parentPath) parentPath = parentPath + '.'
      return Object.entries(object).map((res, index) => (
        (parentPath === '')
          ? <div key={index}>{renderItem(parentPath, res)}</div>
          : <div key={index} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>{renderItem(parentPath, res)}</div>
      ))
    }

    const renderArray = (parentPath, Array) => {
      return (
        <>
          {Array.type === 'object' ? <div>{renderObject(parentPath + '[]', Array.value)}</div> : null}
          {Array.type === 'array' ? <div>{renderItem(parentPath + '[]', ['', Array])}</div> : null}
        </>
      )
    }

    const renderItem = (parentPath, [key, value]) => {
      const CustomTooltip = ({ children, message }) => {
        return (
          <OverlayTrigger
            placement='top'
            delay={{ show: 250, hide: 250 }}
            overlay={<Tooltip style={{ fontFamily: 'monospace' }}>{`${message}`}</Tooltip>}
          >
            {children}
          </OverlayTrigger>
        )
      }
      const defaultItem = (parentPath, [key, value]) => {
        const path = parentPath + key
        const keyTitle = path.split('.')[path.split('.').length - 1]
        return (
          <div className='py-1'>
            {renderType(value.type)}
            <CustomTooltip message={path}>
              <strong className='pl-1' style={{ cursor: 'default' }}>{keyTitle}</strong>
            </CustomTooltip>
            <span>{value.description ? ` : ${value.description}` : ''}</span>
          </div>
        )
      }
      switch (value.type) {
        case 'string' : return defaultItem(parentPath, [key, value])
        case 'number' : return defaultItem(parentPath, [key, value])
        case 'boolean' : return defaultItem(parentPath, [key, value])
        case 'array' :
          return (
            <>
              {defaultItem(parentPath, [key, value])}
              {renderArray(parentPath + key, value.default)}
            </>
          )
        case 'object' :
          return (
            <>
              {defaultItem(parentPath, [key, value])}
              {renderObject(parentPath + key, value.value)}
            </>
          )
        default: return null
      }
    }

    return (
      <div className='public'>
        {renderObject(parentPath, object)}
        <hr />
        {displayLegend()}
      </div>
    )
  }

  render () {
    this.bodyDescription = this.props.body_description
    return (
      <>
        {this.props.body && this.props.body.type === 'multipart/form-data' && (
          <GenericTable
            {...this.props}
            title='formData'
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.original_body.value]}
          />
        )}

        {this.props.body &&
          this.props.body.type === 'application/x-www-form-urlencoded' && (
            <GenericTable
              {...this.props}
              title='x-www-form-urlencoded'
              dataArray={this.props.body.value}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.props.original_body.value]}
            />
        )}

        {this.props.body && this.props.body.type !== 'multipart/form-data' && this.props.body.type !== 'application/x-www-form-urlencoded' && (
          (this.props.body.type === 'JSON')
            ? (
              <div className='hm-public-table'>
                <div className='public-generic-table-title-container'>
                  Body <small className='text-muted'>({this.props.body.type})</small> {willHighlight(this.props, 'body') ? <i className='fas fa-circle' /> : null}
                </div>
                <ul className='public-endpoint-tabs'>
                  <li
                    className={this.state.showBodyCodeEditor ? 'active' : ''}
                    style={this.state.showBodyCodeEditor ? { backgroundColor: this.props.publicCollectionTheme } : {}}
                    onClick={() => this.setState({ showBodyCodeEditor: true })}
                  >
                    Raw
                  </li>
                  <li
                    className={!this.state.showBodyCodeEditor ? 'active' : ''}
                    style={!this.state.showBodyCodeEditor ? { backgroundColor: this.props.publicCollectionTheme } : {}}
                    onClick={() => this.setState({ showBodyCodeEditor: false })}
                  >
                    Body description
                  </li>
                </ul>
                {this.state.showBodyCodeEditor
                  ? (
                    <AceEditor
                      className='custom-raw-editor'
                      mode='json'
                      theme='github'
                      value={this.props.body.value}
                      onChange={this.handleChangeBodyDescription.bind(this)}
                      setOptions={{
                        showLineNumbers: true
                      }}
                      editorProps={{
                        $blockScrolling: false
                      }}
                      onLoad={(editor) => {
                        editor.focus()
                        editor.getSession().setUseWrapMode(true)
                        editor.setShowPrintMargin(false)
                      }}
                    />
                    )
                  : (
                    <div className='body-description-container'>
                      {/* Previous Body Description Layout */}
                      {/* {this.displayObject(this.bodyDescription, 'body_description')} */}
                      {this.displayBodyDecription(undefined, this.bodyDescription)}
                    </div>
                    )}
              </div>
              )
            : (
              <div className='hm-public-table'>
                <div className='public-generic-table-title-container'>
                  Body <small className='text-muted'>({this.props.body.type})</small> {willHighlight(this.props, 'body') ? <i className='fas fa-circle' /> : null}
                </div>
                <AceEditor
                  className='custom-raw-editor'
                  mode={this.props.body.type.toLowerCase()}
                  theme='github'
                  value={this.makeJson(this.props.body.value)}
                  onChange={(value) => this.props.set_body(this.props.body.type, value)}
                  setOptions={{
                    showLineNumbers: true
                  }}
                  editorProps={{
                    $blockScrolling: false
                  }}
                  onLoad={(editor) => {
                    editor.focus()
                    editor.getSession().setUseWrapMode(true)
                    editor.setShowPrintMargin(false)
                  }}
                />
              </div>
              )
        )}
      </>
    )
  }
}

export default PublicBodyContainer
