import Joi from 'joi-browser'
import React from 'react'
import { Modal, Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import shortid from 'shortid'
import Form from '../common/form'
import { addPage } from '../pages/redux/pagesActions'
import { onEnter, toTitleCase } from '../common/utility'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_page: (rootParentId, newPage) => dispatch(addPage(ownProps.history, rootParentId, newPage))
  }
}

class PageForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        name: ''
      },
      errors: {}
    }

    this.schema = {
      name: Joi.string().required().label('Page name'),
      contents: Joi.string().allow(null, ''),
      state: Joi.valid(0, 1, 2, 3)
    }
  }

  componentDidMount() {
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(this.props.selectedCollection, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    this.setState({ versions, groups })
  }

  async doSubmit() {
    if (!this.state.selectedCollection && this.props.addEntity) {
      this.setState({ versionRequired: true })
      return
    }
    const collections = this.props?.selectedCollection
    this.props.onHide()
    let { name } = { ...this.state.data }
    name = toTitleCase(name)
    if (this.props.title === 'Add Parent Page' || this.props.addEntity) {
      const rootParentId = collections?.rootParentId
      const data = { ...this.state.data, name }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props.pageType === 1 ? shortid.generate() : null,
        pageType: this.props.pageType
      }
      this.props.add_page(rootParentId, newPage)
    }
    if (this.props?.title === 'Add Page' || this.props?.title === 'Add Sub Page' || this.props?.addEntity) {
      const selectedId = this.props?.title === 'Add Page' ? this.props?.selectedVersion : this.props?.selectedPage
      const ParentId = selectedId
      const data = { ...this.state.data, name }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props?.pageType === 1 ? shortid.generate() : null,
        pageType: this.props?.pageType,
        state: 0
      }
      this.props.add_page(ParentId, newPage)
    }
  }

  renderGroupList() {
    if (this.state.groups) {
      return Object.keys(this.state.groups).map(
        (id, index) =>
          this.state.groups[id].versionId?.toString() === this.state.selectedVersionId?.toString() && (
            <Dropdown.Item key={index} onClick={() => this.setState({ selectedGroupId: id })}>
              {this.state.groups[id]?.name}
            </Dropdown.Item>
          )
      )
    }
  }

  renderVersionList() {
    if (this.state.versions) {
      return Object.keys(this.state.versions).map((id, index) => (
        <Dropdown.Item key={index} onClick={() => this.setState({ selectedVersionId: id, selectedGroupId: null, versionRequired: false })}>
          {this.state.versions[id]?.number}
        </Dropdown.Item>
      ))
    }
  }

  render() {
    return (
      <div onKeyPress={(e) => onEnter(e, this.handleKeyPress.bind(this))}>
        <Modal
          show={this.props.show}
          onHide={this.props.onHide}
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
        >
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              <div className='row'>
                <div className='col-6'>
                  {this.props.addEntity && (
                    <div className='dropdown-label dropDownversion'>
                      <label> Select Version</label>
                      <Dropdown>
                        <Dropdown.Toggle variant='' id='dropdown-basic'>
                          {this.state.versions?.[this.state.selectedVersionId]?.number || 'Select'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>{this.renderVersionList()}</Dropdown.Menu>
                      </Dropdown>
                      {this.state.versionRequired && <div className='dropdown-validation'>Please select version</div>}
                    </div>
                  )}
                </div>
                <div className='col-6'>
                  {this.state.selectedVersionId && (
                    <div className='dropdown-label dropDownversion'>
                      <label>Select Group</label>
                      <Dropdown>
                        <Dropdown.Toggle variant='' id='dropdown-basic'>
                          {this.state.groups?.[this.state.selectedGroupId]?.name || 'Select'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>{this.renderGroupList()}</Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                </div>
                <div className='col-6'>{this.renderInput('name', 'Page name', 'page name', true, true)}</div>
              </div>
              <div className='text-left mt-2 mb-1'>
                {this.renderButton('Submit')}
                <button className='btn btn-secondary ml-2' onClick={this.props.onHide}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default withRouter(connect(null, mapDispatchToProps)(PageForm))
