import React, { Component, createRef } from 'react'
import { isDashboardRoute } from '../common/utility'
import { updateEndpoint } from '../pages/redux/pagesActions'
import { connect } from 'react-redux'
import './endpointBreadCrumb.scss'
import EndpointBreadCrumb from './endpointBreadCrumb'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_endpoint: (editedEndpoint) => dispatch(updateEndpoint(editedEndpoint))
  }
}

class DisplayDescription extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDescriptionFormFlag: false,
      showAddDescriptionFlag: isDashboardRoute(this.props)
        ? !!(this.props.endpoint.description === '' || this.props.endpoint.description == null)
        : false,
      theme: ''
    }

    this.modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],

        [({ list: 'ordered' }, { list: 'bullet' })],
        ['link']
      ]
    }
    this.contentEditableRef = createRef();
    this.formats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'list', 'bullet', 'link']
  }

  handleChange(e) {
    const data = { ...this.props.data }
    data[e.currentTarget.name] = e.currentTarget.value
    this.props.props_from_parent('data', data)
  }

  componentDidMount() {
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
    if (this.contentEditableRef.current) {
      this.contentEditableRef.current.innerText = this.props?.endpoint?.description;
    }
  }

  handleDescription() {
    const showDescriptionFormFlag = true
    const showAddDescriptionFlag = false
    this.setState({ showDescriptionFormFlag, showAddDescriptionFlag })
  }

  handleDescriptionCancel() {
    const endpoint = { ...this.props.endpoint }
    endpoint.description = this.props.old_description
    const showDescriptionFormFlag = false
    this.setState({
      showDescriptionFormFlag,
      showAddDescriptionFlag: true
    })
    this.props.props_from_parent('endpoint', endpoint)
  }

  handleDescriptionSave(e) {
    e.preventDefault()
    const value = this.props.endpoint.description
    const endpoint = { ...this.props.endpoint }
    this.props.update_endpoint({ id: endpoint.id, description: value })
    endpoint.description = value
    this.setState({
      showDescriptionFormFlag: false,
      showAddDescriptionFlag: true
    })
    this.props.props_from_parent('endpoint', endpoint)
    this.props.props_from_parent('oldDescription', value)
  }

  handleChangeDescription = () => {
    const value = this.contentEditableRef.current.innerText;
    this.props.props_from_parent(value)
  }

  render() {
    return (
      <div className='endpoint-header'>
        <div className={isDashboardRoute(this.props) ? 'panel-endpoint-name-container' : 'endpoint-name-container'}>
          {isDashboardRoute(this.props) && <>{this.props.endpoint && <EndpointBreadCrumb {...this.props} isEndpoint />}</>}
          {isDashboardRoute(this.props) && this.props.endpoint &&
            <div
              ref={this.contentEditableRef}
              onInput={this.handleChangeDescription}
              className='endpoint-description'
              contentEditable={true}
              suppressContentEditableWarning={true}
            >
            </div>
          }
        </div>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(DisplayDescription)
