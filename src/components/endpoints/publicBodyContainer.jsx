import 'ace-builds'
import React, { Component } from 'react'
import GenericTable from './genericTable'
import jQuery from 'jquery'
import AceEditor from 'react-ace'
import { willHighlight } from './highlightChangesHelper'
import './publicEndpoint.scss'
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { bodyTypesEnums, rawTypesEnums } from '../common/bodyTypeEnums'

class PublicBodyContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showBodyCodeEditor: true,
      data: {
        data: [
          {
            checked: 'notApplicable',
            key: '',
            value: '',
            description: '',
            type: 'text'
          }
        ],
        urlencoded: [
          {
            checked: 'notApplicable',
            key: '',
            value: '',
            description: '',
            type: 'text'
          }
        ]
      },
    }
  }

  componentDidMount() {
    const data = {
      data: this.props?.body?.[bodyTypesEnums['multipart/form-data']] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
      urlencoded: this.props?.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
    }
    this.setState({ data });
  }

  handleChangeBody(title, dataArray) {
    const data = this.state.data
    switch (title) {
      case 'formData':
        data.data = dataArray
        this.setState({ data })
        this.props.set_body(bodyTypesEnums['multipart/form-data'], dataArray)
        break
      case 'x-www-form-urlencoded':
        data.urlencoded = dataArray
        this.setState({ data })
        this.props.set_body(bodyTypesEnums['application/x-www-form-urlencoded'], dataArray)
        break
      default:
        break
    }
  }

  setBody(data) {
    this.props.set_body_description(data.bodyDescription)
    this.props.set_public_body(data.body)
  }

  handleChangeBodyDescription = (data) => {
    try {
      const body = JSON.stringify(JSON.parse(data), null, 2);
      const bodyData = {
        bodyDescription: this.bodyDescription,
        body: body
      };
      this.setBody(bodyData);
    } catch (e) {
      console.error("Error beautifying data:", e);
    }
  }

  makeJson(body) {
    try {
      const parsedBody = JSON.stringify(JSON.parse(body), null, 2)
      return parsedBody
    } catch (e) {
      return body
    }
  }

  displayBodyDecription(parentPath = '', object) {
    if (!object) {
      return null
    }
    const displayLegend = () => {
      const types = ['string', 'number', 'boolean', 'array', 'object']
      return (
        <div className='d-flex flex-row-reverse'>
          {types.map((type, index) => (
            <small key={index} className='ml-3 text-small'>
              <Badge className={`body-desc-type ${type}`}>{type.charAt(0)}</Badge> <span className='text-capitalize'>{type}</span>
            </small>
          ))}
        </div>
      )
    }

    const renderType = (type) => {
      return (
        <Badge className={`body-desc-type ${type}`} style={{ cursor: 'default' }}>
          {type.charAt(0)}
        </Badge>
      )
    }

    const renderObject = (parentPath, object) => {
      if (!object) return null
      if (parentPath) parentPath = parentPath + '.'
      return Object.entries(object).map((res, index) =>
        parentPath === '' ? (
          <div key={index}>{renderItem(parentPath, res)}</div>
        ) : (
          <div key={index} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>
            {renderItem(parentPath, res)}
          </div>
        )
      )
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
              <strong className='pl-1' style={{ cursor: 'default' }}>
                {keyTitle}
              </strong>
            </CustomTooltip>
            <span>{value.description ? ` : ${value.description}` : ''}</span>
          </div>
        )
      }
      switch (value.type) {
        case 'string':
          return defaultItem(parentPath, [key, value])
        case 'number':
          return defaultItem(parentPath, [key, value])
        case 'boolean':
          return defaultItem(parentPath, [key, value])
        case 'array':
          return (
            <>
              {defaultItem(parentPath, [key, value])}
              {renderArray(parentPath + key, value.default)}
            </>
          )
        case 'object':
          return (
            <>
              {defaultItem(parentPath, [key, value])}
              {renderObject(parentPath + key, value.value)}
            </>
          )
        default:
          return null
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

  render() {
    this.bodyDescription = this.props.body_description
    if (this.props.body && this.props.body.type === 'none') return null;
    return (
      <>
        {this.props.body && this.props.body.type === bodyTypesEnums['multipart/form-data'] && (
          <GenericTable
            {...this.props}
            title='formData'
            dataArray={this.state.data.data || []}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={this.state.data.data || []}
          />
        )}

        {this.props.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] && this.props.body.type === bodyTypesEnums['application/x-www-form-urlencoded'] && (
          <GenericTable
            {...this.props}
            title='x-www-form-urlencoded'
            dataArray={this.state.data.urlencoded || []}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={this.state.data.urlencoded || []}
          />
        )}

        {this.props.body?.[bodyTypesEnums['multipart/form-data']] &&
          this.props.body.type !== bodyTypesEnums['multipart/form-data'] &&
          this.props.body.type !== bodyTypesEnums['application/x-www-form-urlencoded'] &&
          (this.props.body.type === rawTypesEnums.JSON ? (
            <div className='hm-public-table'>
              <div className='public-generic-table-title-container'>
                Body <small className='text-muted'>({this.props.body.type})</small>{' '}
                {willHighlight(this.props, 'body') ? <i className='fas fa-circle' /> : null}
              </div>
              <ul className='public-endpoint-tabs'>
                <li
                  className={this.state.showBodyCodeEditor ? 'active' : ''}
                  style={this.state.showBodyCodeEditor ? { backgroundColor: '#f2994a' } : {}}
                  onClick={() => this.setState({ showBodyCodeEditor: true })}
                >
                  Raw
                </li>
                <li
                  className={!this.state.showBodyCodeEditor ? 'active' : ''}
                  style={!this.state.showBodyCodeEditor ? { backgroundColor: '#f2994a' } : {}}
                  onClick={() => this.setState({ showBodyCodeEditor: false })}
                >
                  Body description
                </li>
              </ul>
              {this.state.showBodyCodeEditor ? (
                <AceEditor
                  className='custom-raw-editor'
                  mode='json'
                  theme='github'
                  value={this.props.body?.raw?.value}
                  onChange={this.handleChangeBodyDescription.bind(this)}
                  setOptions={{
                    showLineNumbers: true
                  }}
                  editorProps={{
                    $blockScrolling: false
                  }}
                  onLoad={(editor) => {
                    editor.getSession().setUseWrapMode(true)
                    editor.setShowPrintMargin(false)
                  }}
                />
              ) : (
                <div className='body-description-container'>
                  {/* Previous Body Description Layout */}
                  {/* {this.displayObject(this.bodyDescription, 'body_description')} */}
                  {this.displayBodyDecription(undefined, this.bodyDescription)}
                </div>
              )}
            </div>
          ) : (
            <div className='hm-public-table'>
              <div className='public-generic-table-title-container'>
                Body <small className='text-muted'>({this.props.body.type})</small>{' '}
                {willHighlight(this.props, 'body') ? <i className='fas fa-circle' /> : null}
              </div>
              <AceEditor
                className='custom-raw-editor'
                mode={this.props.body.type.toLowerCase()}
                theme='github'
                value={this.makeJson(this.props.body?.raw?.value || '')}
                onChange={(value) => this.props.set_body(this.props.body.type, value)}
                setOptions={{
                  showLineNumbers: true
                }}
                editorProps={{
                  $blockScrolling: false
                }}
                onLoad={(editor) => {
                  if (window.innerWidth > 425) {
                    editor.focus();
                  }
                  editor.getSession().setUseWrapMode(true)
                  editor.setShowPrintMargin(false)
                }}
              />
            </div>
          ))}
      </>
    )
  }
}

export default PublicBodyContainer