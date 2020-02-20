import React, { Component } from 'react'
import endpointService from '../services/endpointService'
import JSONPretty from 'react-json-pretty'
import { Dropdown, Table } from 'react-bootstrap'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { toast } from 'react-toastify'
const status = require('http-status')
var JSONPrettyMon = require('react-json-pretty/dist/monikai')

class DisplayEndpoint extends Component {
  uri = React.createRef()
  body = React.createRef()
  name = React.createRef()

  state = {
    data: {
      name: '',
      method: 'GET',
      body: {},
      uri: '',
      updatedUri: '',
      host: ''
    },
    startTime: '',
    timeElapsed: '',
    response: {},
    endpoint: {},
    groups: [],
    versions: [],
    groupId: '',
    title: '',
    onChangeFlag: false,
    flagResponse: false,
    rawResponse: false,
    prettyResponse: false,
    previewResponse: false,
    flagInvalidResponse: true,
    responseString: '',
    headersData: {},
    originalHeadersKeys: [],
    updatedHeadersKeys: [],
    paramsData: {},
    originalParamsKeys: [],
    updatedParamsKeys: [],
    keys: [],
    values: []
  }

  handleChange = e => {
    let data = { ...this.state.data }
    if (e.currentTarget.name === 'host') {
      this.state.onChangeFlag = true
    }
    data[e.currentTarget.name] = e.currentTarget.value
    if (e.currentTarget.name === 'updatedUri') {
      if (
        (e.currentTarget.value.match(/[?]$/) !== null &&
          e.currentTarget.value.match(/\?\?+/) === null &&
          e.currentTarget.value.split('?')[1] === '') ||
        (e.currentTarget.value.match(/[&]$/) !== null &&
          e.currentTarget.value.match(/\&\&+/) === null)
      ) {
        this.handleAddParam()
      }
      let keys = []
      let values = []
      let originalParamsKeys = [...this.state.originalParamsKeys]
      let updatedParamsKeys = [...this.state.updatedParamsKeys]
      let paramsData = { ...this.state.paramsData }
      data.uri = e.currentTarget.value
      let updatedUri = e.currentTarget.value
      updatedUri = updatedUri.split('?')[1]
      if (updatedUri) {
        let arr = updatedUri.split(/[&=]/)
        for (let i = 0; i < arr.length; i++) {
          if (i % 2 === 0) {
            keys.push(arr[i])
            // updatedParamsKeys[i] = arr[i];
            paramsData[originalParamsKeys[Math.floor(i / 2)]].key = arr[i]
            this.state.updatedParamsKeys = keys
            this.setState({
              keys,
              paramsData
            })
          } else {
            values.push(arr[i])
            paramsData[originalParamsKeys[Math.floor(i / 2)]].value = arr[i]
            this.setState({ values, paramsData })
          }
        }
      }
    }
    this.setState({ data })
  }

  findHost () {
    let host = ''
    if (this.state.onChangeFlag === true) {
      return this.state.data.host
    } else if (
      Object.keys(this.state.endpoint).length &&
      this.state.title === 'update endpoint'
    ) {
      host = this.state.groups[this.state.groupId].host
      if (host === '') {
        const versionId = this.state.groups[this.state.endpoint.groupId]
          .versionId
        host = this.state.versions[versionId].host
      }
    } else if (this.state.groupId) {
      host = this.state.groups[this.state.groupId].host
      if (host === '') {
        const versionId = this.state.groups[this.state.groupId].versionId
        host = this.state.versions[versionId].host
      }
    }
    return host
  }

  finalUrl (api) {
    const regexp = /{{(\w+)}}/g
    let match = regexp.exec(api)
    let variables = []
    if (match === null) return api
    do {
      variables.push(match[1])
    } while ((match = regexp.exec(api)) !== null)
    for (let i = 0; i < variables.length; i++) {
      if (
        this.props.environment.variables[variables[i]] &&
        this.props.environment.variables[variables[i]].initialValue
      ) {
        api = api.replace(
          `{{${variables[i]}}}`,
          this.props.environment.variables[variables[i]].initialValue
        )
      }
    }
    return api
  }

  handleSend = async () => {
    let startTime = new Date().getTime()
    let prettyResponse = true
    this.setState({ startTime, prettyResponse })
    let response = {}
    const headersData = this.doSubmitHeader()
    const paramsData = this.doSubmitParam()
    await this.setState({ headersData, paramsData, response })
    this.state.flagResponse = true
    const host = this.findHost()
    let api = host + this.uri.current.value
    api = this.finalUrl(api)
    let { method, uri, updatedUri, name, body } = this.state.data
    if (method === 'POST' || method === 'PUT') {
      try {
        body = JSON.parse(this.body.current.value)
        this.setState({
          data: {
            method,
            uri,
            updatedUri,
            name,
            body: JSON.stringify(body, null, 4)
          }
        })
      } catch {
        toast.error('Invalid Body')
      }
    }

    let headerJson = {}
    Object.keys(headersData).map(header => {
      headerJson[headersData[header].key] = headersData[header].value
    })
    let responseJson = {}
    try {
      responseJson = await endpointService.apiTest(
        api,
        method,
        body,
        headerJson
      )
      const response = { ...responseJson }
      if (responseJson.status === 200) this.setState({ response })
      this.responseTime()
    } catch (error) {
      if (error.response) {
        let response = {
          status: error.response.status,
          data: error.response.data
        }
        this.setState({ response })
      } else {
        let flagInvalidResponse = false
        this.setState({ flagInvalidResponse })
      }
    }
  }

  handleSave = async e => {
    let body = {}
    if (this.state.data.method === 'POST' || this.state.data.method === 'PUT')
      try {
        body = JSON.parse(this.body.current.value)
      } catch {
        toast.error('Invalid Body')
      }
    const headersData = this.doSubmitHeader()
    const paramsData = this.doSubmitParam()
    const endpoint = {
      uri: this.uri.current.value,
      name: this.name.current.value,
      requestType: this.state.data.method,
      body: body,
      headers: headersData,
      params: paramsData
    }

    if (endpoint.name == '' || endpoint.uri == '')
      toast.error('Please Enter all the fields')
    else if (this.state.title === 'Add New Endpoint') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        title: 'Add Endpoint',
        endpoint: endpoint,
        groupId: this.state.groupId,
        versions: this.state.versions
      })
    } else if (this.state.title === 'update endpoint') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        title: 'update Endpoint',
        endpoint: endpoint,
        groupId: this.state.groupId,
        versions: this.state.versions,
        endpointId: this.state.endpoint.id
      })
    }
  }
  setHost () {
    this.state.hostFlag = true
  }
  setMethod (method) {
    const response = {}
    let data = { ...this.state.data }
    data.method = method
    this.setState({ response, data })
  }

  async handleAddParam () {
    let paramsData = { ...this.state.paramsData }
    const len = this.state.originalParamsKeys.length
    let originalParamsKeys = [...this.state.originalParamsKeys, len.toString()]
    let updatedParamsKeys = [...this.state.updatedParamsKeys, '']
    paramsData[len.toString()] = {
      key: '',
      value: '',
      description: ''
    }
    this.state.originalParamsKeys = originalParamsKeys
    this.state.paramsData = paramsData
    // this.state.updatedParamsKeys = updatedParamsKeys;
    this.setState({ updatedParamsKeys })
  }

  handleDeleteParam (index) {
    const updatedParamsKeys = this.state.updatedParamsKeys
    updatedParamsKeys[index] = 'deleted'
    let keys = []
    let values = []
    for (let i = 0; i < this.state.keys.length; i++) {
      if (i === index) {
        continue
      }
      keys.push(this.state.keys[i])
      values.push(this.state.values[i])
    }
    this.state.keys = keys
    this.state.values = values
    this.handleUpdateUri(keys, values)
    this.setState({ updatedParamsKeys })
  }

  handleUpdateUri (keys, values) {
    let originalUri = this.state.data.uri.split('?')[0] //Possible mistake
    let updatedUri = this.state.data.updatedUri

    if (this.state.title === 'Add New Endpoint') {
      for (let i = 0; i < keys.length; i++) {
        if (i === 0) {
          if (keys[i].length === 0) {
            updatedUri = originalUri.substring(0, originalUri.length - 1)
          } else {
            updatedUri = originalUri + '?' + keys[i] + '=' + values[i]
            originalUri = updatedUri
          }
        } else {
          if (keys[i].length === 0) {
            originalUri = originalUri.substring(0, originalUri.length - 1)
          } else {
            if (originalUri.split('?')[1]) {
              updatedUri = originalUri + '&' + keys[i] + '=' + values[i]
              originalUri = updatedUri
            } else {
              updatedUri = originalUri + '?' + keys[i] + '=' + values[i]
              originalUri = updatedUri
            }
          }
        }
      }
    } else if (this.state.title === 'update endpoint') {
      originalUri = originalUri.split('?')[0]
      if (keys.length === 0) {
        updatedUri = originalUri
      }
      for (let i = 0; i < keys.length; i++) {
        if (i === 0) {
          if (keys[i].length === 0) {
            updatedUri = originalUri.substring(0, originalUri.length - 1)
          } else {
            updatedUri = originalUri + '?' + keys[i] + '=' + values[i]
            originalUri = updatedUri
          }
        } else {
          if (keys[i].length === 0) {
            originalUri = originalUri.substring(0, originalUri.length - 1)
          } else {
            if (originalUri.split('?')[1]) {
              updatedUri = originalUri + '&' + keys[i] + '=' + values[i]
              originalUri = updatedUri
            } else {
              updatedUri = originalUri + '?' + keys[i] + '=' + values[i]
              originalUri = updatedUri
            }
          }
        }
      }
    }
    this.state.data.updatedUri = updatedUri
  }

  handleChangeParam = e => {
    const name = e.currentTarget.name.split('.')
    const originalParamsKeys = [...this.state.originalParamsKeys]
    const updatedParamsKeys = [...this.state.updatedParamsKeys]
    let keys = this.state.keys
    let values = this.state.values
    if (name[1] === 'key') {
      updatedParamsKeys[name[0]] = e.currentTarget.value
      keys[name[0]] = e.currentTarget.value
      this.state.keys = keys
      this.handleUpdateUri(keys, values)
      let paramsData = { ...this.state.paramsData }
      paramsData[originalParamsKeys[name[0]]][name[1]] = e.currentTarget.value
      this.setState({
        updatedParamsKeys,
        paramsData
      })
    } else {
      let paramsData = { ...this.state.paramsData }
      paramsData[originalParamsKeys[name[0]]][name[1]] = e.currentTarget.value
      if (name[1] === 'value') {
        values[name[0]] = e.currentTarget.value
        this.state.values = values
        this.handleUpdateUri(keys, values)
      }
      this.setState({ paramsData })
    }
  }

  doSubmitParam () {
    let paramsData = { ...this.state.paramsData }
    let originalParamsKeys = [...this.state.originalParamsKeys]
    let newOriginalParamsKeys = []
    let updatedParamsKeys = [...this.state.updatedParamsKeys]
    for (let i = 0; i < originalParamsKeys.length; i++) {
      if (paramsData[originalParamsKeys[i]].key === '') {
        delete paramsData[originalParamsKeys[i]]
      } else {
        newOriginalParamsKeys.push(originalParamsKeys[i])
      }
    }
    originalParamsKeys = newOriginalParamsKeys
    for (let i = 0; i < updatedParamsKeys.length; i++) {
      if (updatedParamsKeys[i] !== originalParamsKeys[i]) {
        if (updatedParamsKeys[i] === 'deleted') {
          delete paramsData[originalParamsKeys[i]]
        } else {
          paramsData[updatedParamsKeys[i]] = paramsData[originalParamsKeys[i]]
          paramsData[updatedParamsKeys[i]].key = updatedParamsKeys[i]
          delete paramsData[originalParamsKeys[i]]
        }
      }
    }
    if (paramsData['']) delete paramsData['']
    updatedParamsKeys = updatedParamsKeys.filter(k => k !== '')
    originalParamsKeys = [...updatedParamsKeys]
    const endpoint = { ...this.state.endpoint }
    endpoint.params = { ...paramsData }
    this.setState({
      originalParamsKeys,
      updatedParamsKeys,
      endpoint,
      paramsData
    })
    return paramsData
  }

  handleAddHeader () {
    let headersData = { ...this.state.headersData }
    const len = this.state.originalHeadersKeys.length
    let originalHeadersKeys = [
      ...this.state.originalHeadersKeys,
      len.toString()
    ]
    let updatedHeadersKeys = [...this.state.updatedHeadersKeys, '']
    headersData[len.toString()] = {
      key: '',
      value: '',
      description: ''
    }
    this.setState({ headersData, originalHeadersKeys, updatedHeadersKeys })
  }

  handleDeleteHeader (index) {
    const updatedHeadersKeys = this.state.updatedHeadersKeys
    updatedHeadersKeys[index] = 'deleted'
    this.setState({ updatedHeadersKeys })
  }

  handleChangeHeader = e => {
    const name = e.currentTarget.name.split('.')
    const originalHeadersKeys = [...this.state.originalHeadersKeys]
    const updatedHeadersKeys = [...this.state.updatedHeadersKeys]
    if (name[1] === 'key') {
      updatedHeadersKeys[name[0]] = e.currentTarget.value
    }

    let headersData = { ...this.state.headersData }
    headersData[originalHeadersKeys[name[0]]][name[1]] = e.currentTarget.value
    this.setState({ headersData, updatedHeadersKeys })
  }

  doSubmitHeader () {
    let headersData = { ...this.state.headersData }
    let originalHeadersKeys = [...this.state.originalHeadersKeys]
    let updatedHeadersKeys = [...this.state.updatedHeadersKeys]

    for (let i = 0; i < updatedHeadersKeys.length; i++) {
      if (updatedHeadersKeys[i] !== originalHeadersKeys[i]) {
        if (updatedHeadersKeys[i] === 'deleted') {
          delete headersData[originalHeadersKeys[i]]
        } else {
          headersData[updatedHeadersKeys[i]] =
            headersData[originalHeadersKeys[i]]
          headersData[updatedHeadersKeys[i]].key = updatedHeadersKeys[i]
          delete headersData[originalHeadersKeys[i]]
        }
      }
    }

    if (headersData['']) delete headersData['']
    updatedHeadersKeys = updatedHeadersKeys.filter(k => k !== '')
    originalHeadersKeys = [...updatedHeadersKeys]
    const endpoint = { ...this.state.endpoint }
    endpoint.headers = { ...headersData }
    this.setState({
      originalHeadersKeys,
      updatedHeadersKeys,
      endpoint,
      headersData
    })
    return headersData
  }

  responseTime () {
    let timeElapsed = new Date().getTime() - this.state.startTime
    this.setState({ timeElapsed })
  }
  rawDataResponse () {
    let rawResponse = true
    let previewResponse = false
    let prettyResponse = false
    let responseString = JSON.stringify(this.state.response)
    this.setState({
      rawResponse,
      previewResponse,
      prettyResponse,
      responseString
    })
  }
  prettyDataResponse () {
    let rawResponse = false
    let previewResponse = false
    let prettyResponse = true
    let responseString = JSON.stringify(this.state.response)
    this.setState({
      rawResponse,
      previewResponse,
      prettyResponse,
      responseString
    })
  }
  previewDataResponse () {
    let rawResponse = false
    let previewResponse = true
    let prettyResponse = false
    this.setState({ rawResponse, previewResponse, prettyResponse })
  }

  render () {
    if (this.props.location.endpoint) {
      this.state.prettyResponse = false
      this.state.rawResponse = false
      this.state.previewResponse = false
      let paramsData = { ...this.props.location.endpoint.params }
      const originalParamsKeys = Object.keys(paramsData)
      const updatedParamsKeys = Object.keys(paramsData)
      let headersData = { ...this.props.location.endpoint.headers }
      const originalHeadersKeys = Object.keys(headersData)
      const updatedHeadersKeys = Object.keys(headersData)
      this.setState({
        paramsData,
        originalParamsKeys,
        updatedParamsKeys,
        headersData,
        originalHeadersKeys,
        updatedHeadersKeys
      })
      this.props.history.push({ endpoint: null })
    }

    if (this.props.location.groups) {
      this.state.groups = this.props.location.groups
    }

    if (this.props.location.title === 'Add New Endpoint') {
      this.setState({
        data: {
          name: '',
          method: 'GET',
          body: {},
          uri: '',
          updatedUri: '',
          host: ''
        },
        startTime: '',
        timeElapsed: '',
        response: {},
        endpoint: {},
        groups: this.props.location.groups,
        versions: [],
        groupId: this.props.location.groupId,
        title: this.props.location.title,
        onChangeFlag: false,
        flagResponse: false,
        rawResponse: false,
        prettyResponse: false,
        previewResponse: false,
        flagInvalidResponse: true,
        responseString: '',
        copied: false,
        headersData: {},
        originalHeadersKeys: [],
        updatedHeadersKeys: [],

        paramsData: {},
        originalParamsKeys: [],
        updatedParamsKeys: [],
        keys: [],
        values: []
      })
      this.props.history.push({ groups: null })
    }

    if (this.props.location.versions) {
      this.state.versions = this.props.location.versions
    }

    if (
      this.props.location.title === 'update endpoint' &&
      this.props.location.endpoint
    ) {
      let endpoint = { ...this.props.location.endpoint }
      let values = []
      Object.keys(this.props.location.endpoint.params).map(param => {
        values.push(this.props.location.endpoint.params[param].value)
      })
      this.setState({
        data: {
          method: endpoint.requestType,
          uri: endpoint.uri,
          updatedUri: endpoint.uri,
          name: endpoint.name,
          body: JSON.stringify(endpoint.body, null, 4)
        },
        title: 'update endpoint',
        response: {},
        groupId: this.props.location.groupId,
        onChangeFlag: false
      })
      this.state.endpoint = endpoint
      this.state.values = values
      this.state.keys = Object.keys(this.props.location.endpoint.params)
      this.props.history.push({ endpoint: null })
    }

    return (
      <div>
        <div className='input-group flex-nowrap'>
          <div className='input-group-prepend'>
            <span className='input-group-text' id='addon-wrapping'>
              Endpoint Name :
            </span>
          </div>
          <input
            type='text'
            className='form-control'
            aria-label='Username'
            aria-describedby='addon-wrapping'
            name='name'
            ref={this.name}
            value={this.state.data.name}
            onChange={this.handleChange}
          />
        </div>
        <br></br>
        <div className='input-group mb-3'>
          <div className='input-group-prepend'>
            <span className='input-group-text' id='basic-addon3'>
              <div className='dropdown'>
                <div className='Environment Dropdown'>
                  <Dropdown className='float-light'>
                    <Dropdown.Toggle variant='default' id='dropdown-basic'>
                      {this.state.data.method}
                    </Dropdown.Toggle>

                    <Dropdown.Menu alignRight>
                      <Dropdown.Item onClick={() => this.setMethod('GET')}>
                        GET
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setMethod('POST')}>
                        POST
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setMethod('PUT')}>
                        PUT
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => this.setMethod('DELETE')}>
                        DELETE
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </span>
            <span
              className='form-control form-control-lg'
              className='input-group-text d-flex p-0'
              id='basic-addon3'
            >
              <input
                ref={this.host}
                type='text'
                name='host'
                className='form-group h-100 m-0'
                style={{
                  border: 'none',
                  borderRadius: 0,
                  backgroundColor: '#F8F9F9'
                }}
                value={this.findHost()}
                onChange={this.handleChange}
              />
            </span>
          </div>
          <input
            ref={this.uri}
            type='text'
            value={this.state.data.updatedUri}
            name='updatedUri'
            className='form-control form-control-lg h-auto'
            id='basic-url'
            aria-describedby='basic-addon3'
            onChange={this.handleChange}
          />
          <div className='d-flex'>
            <button
              className='btn btn-secondary ml-3'
              type='submit'
              id='button-addon2'
              onClick={() => this.handleSend()}
            >
              Send
            </button>
            <button
              className='btn btn-secondary ml-3'
              type='button'
              id='button-addon2'
              onClick={() => this.handleSave()}
            >
              Save
            </button>
          </div>
        </div>
        <div>
          <ul className='nav nav-pills mb-3' id='pills-tab' role='tablist'>
            <li className='nav-item'>
              <a
                className='nav-link active'
                id='pills-params-tab'
                data-toggle='pill'
                href='#pills-home'
                role='tab'
                aria-controls='pills-home'
                aria-selected='true'
              >
                Params
              </a>
            </li>
            <li className='nav-item'>
              <a
                className='nav-link'
                id='pills-headers-tab'
                data-toggle='pill'
                href='#pills-profile'
                role='tab'
                aria-controls='pills-profile'
                aria-selected='false'
              >
                Headers
              </a>
            </li>
            <li className='nav-item'>
              <a
                className='nav-link'
                id='pills-body-tab'
                data-toggle='pill'
                href='#pills-contact'
                role='tab'
                aria-controls='pills-contact'
                aria-selected='false'
              >
                Body
              </a>
            </li>
          </ul>
          <div className='tab-content' id='pills-tabContent'>
            <div
              className='tab-pane fade show active'
              id='pills-home'
              role='tabpanel'
              aria-labelledby='pills-params-tab'
            >
              <Table bordered size='sm'>
                <thead>
                  <tr>
                    <th>KEY</th>
                    <th>VALUE</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>

                <tbody>
                  {this.state.updatedParamsKeys.map((params, index) =>
                    params !== 'deleted' ? (
                      <tr key={index}>
                        <td>
                          <input
                            name={index + '.key'}
                            value={this.state.keys[index]}
                            onChange={this.handleChangeParam}
                            type={'text'}
                            className='form-control'
                            style={{ border: 'none' }}
                          />
                        </td>
                        <td>
                          <input
                            name={index + '.value'}
                            value={this.state.values[index]}
                            onChange={this.handleChangeParam}
                            type={'text'}
                            className='form-control'
                            style={{ border: 'none' }}
                          />
                        </td>
                        <td>
                          <input
                            name={index + '.description'}
                            value={
                              this.state.paramsData[
                                this.state.originalParamsKeys[index]
                              ]
                                ? this.state.paramsData[
                                    this.state.originalParamsKeys[index]
                                  ].description
                                : ''
                            }
                            onChange={this.handleChangeParam}
                            type={'text'}
                            style={{ border: 'none' }}
                            className='form-control'
                          />
                        </td>
                        <td>
                          <button
                            type='button'
                            className='btn btn-light btn-sm btn-block'
                            onClick={() => this.handleDeleteParam(index)}
                          >
                            x
                          </button>
                        </td>
                      </tr>
                    ) : null
                  )}
                  <tr>
                    <td> </td>
                    <td>
                      {' '}
                      <button
                        type='button'
                        className='btn btn-link btn-sm btn-block'
                        onClick={() => this.handleAddParam()}
                      >
                        + New Param
                      </button>
                    </td>
                    <td> </td>
                    <td> </td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div
              className='tab-pane fade'
              id='pills-profile'
              role='tabpanel'
              aria-labelledby='pills-headers-tab'
            >
              <div>
                <Table bordered size='sm'>
                  <thead>
                    <tr>
                      <th>KEY</th>
                      <th>VALUE</th>
                      <th>DESCRIPTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {this.state.updatedHeadersKeys.map((header, index) =>
                      header !== 'deleted' ? (
                        <tr key={index}>
                          <td>
                            <input
                              name={index + '.key'}
                              value={
                                this.state.headersData[
                                  this.state.originalHeadersKeys[index]
                                ].key
                              }
                              onChange={this.handleChangeHeader}
                              type={'text'}
                              className='form-control'
                              style={{ border: 'none' }}
                            />
                          </td>
                          <td>
                            <input
                              name={index + '.value'}
                              value={
                                this.state.headersData[
                                  this.state.originalHeadersKeys[index]
                                ].value
                              }
                              onChange={this.handleChangeHeader}
                              type={'text'}
                              className='form-control'
                              style={{ border: 'none' }}
                            />
                          </td>
                          <td>
                            <input
                              name={index + '.description'}
                              value={
                                this.state.headersData[
                                  this.state.originalHeadersKeys[index]
                                ].description
                              }
                              onChange={this.handleChangeHeader}
                              type={'text'}
                              style={{ border: 'none' }}
                              className='form-control'
                            />
                          </td>
                          <td>
                            <button
                              type='button'
                              className='btn btn-light btn-sm btn-block'
                              onClick={() => this.handleDeleteHeader(index)}
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ) : null
                    )}
                    <tr>
                      <td> </td>
                      <td>
                        {' '}
                        <button
                          type='button'
                          className='btn btn-link btn-sm btn-block'
                          onClick={() => this.handleAddHeader()}
                        >
                          + New Header
                        </button>
                      </td>
                      <td> </td>
                      <td> </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
            <div
              className='tab-pane fade'
              id='pills-contact'
              role='tabpanel'
              aria-labelledby='pills-body-tab'
            >
              <textarea
                className='form-control'
                ref={this.body}
                name='body'
                id='body'
                rows='8'
                name='body'
                onChange={this.handleChange}
                value={this.state.data.body}
              ></textarea>
            </div>
          </div>
        </div>
        {this.state.response.status ? (
          this.state.response.status === 200 ? (
            <div>
              <div className='alert alert-success' role='alert'>
                Status :{' '}
                {this.state.response.status +
                  ' ' +
                  this.state.response.statusText}
                <div style={{ float: 'right' }}>
                  Time:{this.state.timeElapsed}ms
                </div>
              </div>
            </div>
          ) : (
            <div className='alert alert-danger' role='alert'>
              Status :
              {this.state.response.status +
                ' ' +
                status[this.state.response.status]}
            </div>
          )
        ) : null}

        {this.state.flagResponse === true &&
        (this.state.prettyResponse === true ||
          this.state.rawResponse === true ||
          this.state.previewResponse === true) ? (
          <div>
            <div>
              <Navbar bg='primary' variant='dark'>
                <Navbar.Brand href='#home'></Navbar.Brand>
                <Nav className='mr-auto'>
                  <Nav.Link onClick={this.prettyDataResponse.bind(this)}>
                    Pretty
                  </Nav.Link>
                  <Nav.Link onClick={this.rawDataResponse.bind(this)}>
                    Raw
                  </Nav.Link>
                  <Nav.Link onClick={this.previewDataResponse.bind(this)}>
                    Preview
                  </Nav.Link>
                </Nav>
                <CopyToClipboard
                  text={JSON.stringify(this.state.response.data)}
                  onCopy={() => this.setState({ copied: true })}
                  style={{ float: 'right', borderRadius: '12px' }}
                >
                  <button style={{ borderRadius: '12px' }}>Copy</button>
                </CopyToClipboard>
              </Navbar>
            </div>

            {this.state.prettyResponse === true ? (
              <div>
                <JSONPretty
                  theme={JSONPrettyMon}
                  data={this.state.response.data}
                />
              </div>
            ) : null}
            {this.state.rawResponse === true ? (
              <div style={{ display: 'block', whiteSpace: 'normal' }}>
                {this.state.responseString}
              </div>
            ) : null}
            {this.state.previewResponse === true ? (
              <div style={{ display: 'block', whiteSpace: 'normal' }}>
                feature coming soon
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }
}

export default DisplayEndpoint
