import 'ace-builds'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/webpack-resolver'
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools'
import React, { Component } from 'react'
import AceEditor from 'react-ace'
import BodyDescription from './bodyDescription'
import './endpoints.scss'
import GenericTable from './genericTable'
import { isSavedEndpoint } from '../common/utility'
import _ from 'lodash'

class BodyContainer extends Component {
  _isMounted = false // Add a flag to track if the component is mounted
  constructor(props) {
    super(props)
    this.state = {
      selectedBodyType: null,
      data: {
        raw: '',
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
      endpointId: null,
      selectedRawBodyType: 'TEXT',
      suggestions: []
    }

    this.rawBodyTypes = ['TEXT', 'HTML', 'JSON', 'XML', 'JavaScript']
    addCompleter({
      getCompletions: function (editor, session, pos, prefix, callback) {
        callback(null, [...this.state.suggestions])
      }.bind(this)
    })
    this.loadEnvVarsSuggestions()
  }

  componentDidMount() {
    this._isMounted = true
    this.setStateOfBody(this.props.body);
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.environment !== this.props.environment) {
      this.loadEnvVarsSuggestions();
    }

    const { body: prevBody } = prevProps;
    const { body: currentBody } = this.props;
    const { data: prevData } = prevState;
    const { data: currentData } = this.state;

    if (
      !_.isEqual(prevBody, currentBody) ||
      !_.isEqual(prevData, currentData)
    ) {
      this.setStateOfBody(currentBody);
    }
  }

  setStateOfBody(body) {
    let selectedBodyType = body.type;
    if (
      selectedBodyType === 'JSON' ||
      selectedBodyType === 'HTML' ||
      selectedBodyType === 'JavaScript' ||
      selectedBodyType === 'XML' ||
      selectedBodyType === 'TEXT'
    ) {
      this.showRawBodyType = true;
      this.rawBodyType = selectedBodyType;
      selectedBodyType = 'raw';
    }

    const data = {
      data: body?.['multipart/form-data'] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
      urlencoded: body?.['application/x-www-form-urlencoded'] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
      raw: body?.raw?.value || ''
    };

    this.rawBodyType = body?.raw?.rawType || 'TEXT';

    this.setState({
      selectedRawBodyType: body?.raw?.rawType || 'TEXT',
      selectedBodyType,
      data
    });
  }

  handleSelectBodyType(bodyType, bodyDescription) {
    switch (bodyType) {
      case 'multipart/form-data':
        this.props.set_body(bodyType, this.state.data.data, this.state.selectedRawBodyType)
        break
      case 'application/x-www-form-urlencoded':
        this.props.set_body(bodyType, this.state.data.urlencoded, this.state.selectedRawBodyType)
        break
      case 'none':
        this.props.set_body(bodyType, null, this.state.selectedRawBodyType)
        break
      default:
        break
    }
    if (bodyType === 'raw' && bodyDescription) {
      this.flag = true
      this.showRawBodyType = true
      if (this._isMounted) {
        this.setState((prevState) => ({
          selectedBodyType: prevState.selectedRawBodyType
        }))
      }
      this.props.set_body(this.state.selectedRawBodyType, this.state.data.raw, this.state.selectedRawBodyType || 'TEXT')
    } else {
      this.flag = false
      if (document.getElementById(`toggle-raw-${this.props.endpoint_id}`)) {
        document.getElementById(`toggle-raw-${this.props.endpoint_id}`).className = 'btn btn-secondary active'
        document.getElementById(`toggle-body-description-${this.props.endpoint_id}`).className = 'btn btn-secondary '
      }
      if (bodyType === 'raw') {
        this.showRawBodyType = true
        if (this._isMounted) {
          this.setState({
            selectedBodyType: 'raw', // Set selectedBodyType to 'raw'
            selectedRawBodyType: this.state.selectedRawBodyType
          })
        }
        this.props.set_body(this.state.selectedRawBodyType, this.state.data[bodyType], this.state.selectedRawBodyType || 'TEXT')
      } else {
        this.showRawBodyType = false
        if (this._isMounted) {
          this.setState({
            selectedBodyType: bodyType
          })
        }
      }
    }
  }

  loadEnvVarsSuggestions() {
    const suggestions = []
    _.keys(this.props.environment.variables).forEach((variable) => {
      suggestions.push({
        caption: `${variable}`,
        value: `{{${variable}}}`,
        meta: 'Environment variable'
      })
    })
    if (this._isMounted) {
      this.setState({ suggestions })
    }
  }

  handleChange(value) {
    this.alteredBody = true
    const data = { ...this.state.data }
    data.raw = value
    if (this._isMounted) {
      this.setState({ data })
    }
    this.props.set_body(this.state.selectedRawBodyType, value, this.state.selectedRawBodyType || 'TEXT')
  }

  handleChangeBody(title, dataArray) {
    const data = { ...this.state.data }
    switch (title) {
      case 'formData':
        data.data = dataArray
        if (this._isMounted) {
          this.setState({ data })
        }
        this.props.set_body(this.state.selectedBodyType, dataArray, this.state.selectedRawBodyType || 'TEXT')
        break
      case 'x-www-form-urlencoded':
        data.urlencoded = dataArray
        if (this._isMounted) {
          this.setState({ data })
        }
        this.props.set_body(this.state.selectedBodyType, dataArray, this.state.selectedRawBodyType || 'TEXT')
        break
      default:
        break
    }
  }

  makeJson(body) {
    if (!this.alteredBody) {
      try {
        const parsedBody = JSON.stringify(JSON.parse(body), null, 2)
        return parsedBody
      } catch (e) {
        return body
      }
    } else {
      return body
    }
  }

  setRawBodyType(rawBodyType) {
    if (this._isMounted) {
      this.setState({
        selectedRawBodyType: rawBodyType,
        selectedBodyType: this.state.selectedBodyType === 'raw' ? 'raw' : rawBodyType
      })
    }
    this.props.set_body(rawBodyType, this.state.data.raw, rawBodyType)
  }

  renderBody() {
    if (this.state.selectedBodyType && this.flag) {
      return <BodyDescription {...this.props} body={this.state.data.raw} body_type={this.state.selectedRawBodyType} />
    } else if (this.state.selectedBodyType) {
      switch (this.state.selectedBodyType) {
        case 'multipart/form-data':
          return (
            <GenericTable
              {...this.props}
              title='formData'
              dataArray={[...this.state.data.data]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.data]}
              count='1'
            />
          )
        case 'application/x-www-form-urlencoded':
          return (
            <GenericTable
              {...this.props}
              title='x-www-form-urlencoded'
              dataArray={[...this.state.data.urlencoded]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.urlencoded]}
              count='2'
            />
          )

        case 'none':
          return
        default:
          return (
            <div>
              {' '}
              <AceEditor
                className='custom-raw-editor'
                mode={this.state.selectedRawBodyType.toLowerCase()}
                theme='github'
                value={this.state.selectedRawBodyType === 'JSON' ? this.makeJson(this.state.data.raw) : this.state.data.raw}
                onChange={this.handleChange.bind(this)}
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
                enableLiveAutocompletion
                enableBasicAutocompletion
              />
            </div>
          )
      }
    }
  }

  matchCurrentBodyType(bodyType) {
    if (this.props.body && this.props.body.type + '-' + this.props.endpoint_id === bodyType) return true
    return false
  }

  render() {
    if (this.props.location.pathname.split('/')[5] !== this.endpointId) {
      this.endpointId = this.props.location.pathname.split('/')[5]
      this.alteredBody = false
    }

    return (
      <div className='body-wrapper'>
        <span style={{ fontWeight: 600 }}>Body</span>
        <div className='button-panel-wrapper'>
          <form className='body-select d-flex align-items-center mb-4'>
            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                id={`none-${this.props.endpoint_id}`}
                defaultChecked={!this.state.selectedBodyType}
                onClick={() => this.handleSelectBodyType('none')}
                className='custom-radio-input'
              />
              <span>none</span>
              <span className='checkmark' />
            </label>

            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                id={`raw-${this.props.endpoint_id}`}
                onClick={() => this.handleSelectBodyType('raw')}
                onChange={() => { }}
                className='custom-radio-input'
                checked={this.state.selectedBodyType === 'raw'}
              />
              <span>raw</span>
              <span className='checkmark' />
            </label>
            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                id={`multipart/form-data-${this.props.endpoint_id}`}
                onClick={() => this.handleSelectBodyType('multipart/form-data')}
                onChange={() => { }}
                className='custom-radio-input'
                checked={this.matchCurrentBodyType(`multipart/form-data-${this.props.endpoint_id}`)}
              />
              <span>form-data</span>
              <span className='checkmark' />
            </label>
            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                id={`application/x-www-form-urlencoded-${this.props.endpoint_id}`}
                onClick={() => this.handleSelectBodyType('application/x-www-form-urlencoded')}
                className='custom-radio-input'
                onChange={() => { }}
                checked={this.matchCurrentBodyType(`application/x-www-form-urlencoded-${this.props.endpoint_id}`)}
              />
              <span>x-www-form-urlencoded</span>
              <span className='checkmark' />
            </label>
            {!(this.showRawBodyType && this.flag) && (
              <div className='body'>
                {this.showRawBodyType === true && (
                  <div>
                    <div className='dropdown'>
                      <button
                        className='btn dropdown-toggle'
                        type='button'
                        id='dropdownMenuButton'
                        data-toggle='dropdown'
                        aria-haspopup='true'
                        aria-expanded='false'
                      >
                        {this.state.selectedRawBodyType}
                      </button>
                      <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                        {this.rawBodyTypes.map((rawBodyType) => (
                          <button
                            className='dropdown-item'
                            type='button'
                            onClick={() => this.setRawBodyType(rawBodyType)}
                            key={rawBodyType}
                          >
                            {rawBodyType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
          {isSavedEndpoint(this.props) &&
            this.state.selectedRawBodyType === 'JSON' &&
            (this.state.selectedBodyType === 'raw' || this.state.selectedBodyType === 'JSON') && (
              <div className='btn-group btn-group-toggle customBtnGroup mb-4' data-toggle='buttons' style={{ float: 'right' }}>
                <label className='btn btn-secondary active' id={`toggle-raw-${this.props.endpoint_id}`}>
                  <input
                    type='radio'
                    name='options'
                    id='option1'
                    autoComplete='off'
                    defaultChecked
                    onClick={() => this.handleSelectBodyType('raw')}
                  />
                  Raw
                </label>
                <label className='btn btn-secondary body-desc' id={`toggle-body-description-${this.props.endpoint_id}`}>
                  <input
                    type='radio'
                    name='options'
                    id='option2'
                    autoComplete='off'
                    onClick={() => this.handleSelectBodyType('raw', 'bodyDescription')}
                  />
                  Body Description
                </label>
              </div>
            )}
        </div>
        <div className='body-container'>{this.renderBody()}</div>
      </div>
    )
  }
}

export default BodyContainer
