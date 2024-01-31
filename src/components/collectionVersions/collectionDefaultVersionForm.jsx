import React, {Component} from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { URL_VALIDATION_REGEX } from '../common/constants'
import { onEnter, toTitleCase, ADD_VERSION_MODAL_NAME, DEFAULT_URL } from '../common/utility'
import { addParentPageVersion, updateVersion } from '../collectionVersions/redux/collectionVersionsActions'
import { moveToNextStep } from '../../services/widgetService'
import shortid from 'shortid'
import { Card, Dropdown, Accordion, DropdownButton, Button } from 'react-bootstrap'
import { onDefaultVersion } from '../publishDocs/redux/publishDocsActions'


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_parentpage_version: (newCollectionVersion, parentPageId, callback) =>
    dispatch(addParentPageVersion(newCollectionVersion, parentPageId, callback)),
    set_Default_Version: (orgId, versionData) => dispatch(onDefaultVersion(orgId, versionData)),
  }
}
class CollectionDefaultVersionForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: { name: '', state: 0 },
      errors: {},
      versionId: null,
      parentPageId: '',
      defaultVersionName: '',
      selectedVersionId: '',
      defaultVersionId: '',
      selectedVersionName: ''
    }

    this.schema = {
      name: Joi.string().required().label('Version Name').max(20),
      state: Joi.valid(0, 1).optional()
    }
  }

  async componentDidMount() {
    let data = {}
    const parentPageId = ''
    let versionId = ''
    if (this.props.title === ADD_VERSION_MODAL_NAME) return
    if (this.props.selectedVersion) {
      const { name, type, id } = this.props.selectedVersion
      data = {
        name,
        type
      }
      versionId = id
    }
    this.setState({ data, versionId, parentPageId })
    const defaultVersion = this.findDefaultVersion()
    if (defaultVersion) {
        this.setState({
          defaultVersionName: defaultVersion.name,
          selectedVersionId: defaultVersion.id,
          defaultVersionId: defaultVersion.id,
          selectedVersionName: defaultVersion.name,
        })
      }
  }
  findDefaultVersion = () => {
    const { pages, rootParentId } = this.props
    const children = pages[rootParentId]?.child || []
    return children.map((childId) => pages[childId]).find((page) => page.state === 1)
  }

  redirectToForm(version) {
    if (this.props.setDropdownList) this.props.setDropdownList(version)
  }

   handleSubmit() {
    this.props.onHide()
    // let { name } = { ...this.state.data }
    // name = toTitleCase(name)
    // if (this.props.title === 'Edit Collection Version') {
    //   const { id, parentPageId } = this.props.selectedVersion
    //   const editedCollectionVersion = { ...this.state.data, parentPageId, id, name }
    //   this.props.update_version(editedCollectionVersion)
    // }
    // if (this.props.title === ADD_VERSION_MODAL_NAME) {
    //   const parentPageId = this.props.parentPage_id
    //   const newVersion = { ...this.state.data, requestId: shortid.generate(), name }
    //   this.props.add_parentpage_version(newVersion, parentPageId, this.redirectToForm.bind(this))
    //   moveToNextStep(2)
    // }
  }

  selectDefaultVersion(id, index){
 const versionData = { oldVersionId: this.state.defaultVersionId, newVersionId: id }
    if (this.state.defaultVersionId !== id) {
      this.props.set_Default_Version(this.props.match.params.orgId, versionData)
      this.props.set_Default_version_Id({
        value: id,
        defaultVersionId: id,
        rootId: this.props.rootParentId
      })
    }
    this.setState({defaultVersionId: id, defaultVersionName: this.props.pages[id].name})
  }

  render() {
    const rootId = this.props.rootParentId
    return (
      <div
        // onKeyPress={(e) => {
        //   onEnter(e, this.handleKeyPress.bind(this))
        // }}
      >
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
            {/* <form> */}
              <div className='row'>
                <div className='col-6'>
                  {/* {this.renderInput(
                    'name',
                    'Version Name',
                    'Version Name',
                    true,
                    true,
                    false,
                    '*version name accepts min 1 & max 20 characters'
                  )} */}
                  <DropdownButton
                      id='dropdown-basic-button'
                      title={
                        <span className='dropdown-title'>
                          {this.state.defaultVersionName}
                        </span>
                      }
                      //  show={true}
                    >
                      {this.props.pages[rootId].child.map((childId, index) => (
                        <Dropdown.Item onClick={() => {this.selectDefaultVersion(childId, index )}}>
                          {this.props.pages[childId].name}
                        </Dropdown.Item>
                      ))} 
                    </DropdownButton>
                </div>
                {/* <div className='col-6'>{this.renderInput('host', 'Version Endpoint', 'https://v1.example.com', false, false, true)}</div> */}
              </div>
              {/* <div className='text-left mt-4 mb-2'>
                <Button onClick={this.handleSubmit}>Submit</Button>
                <button className='btn btn-secondary outline btn-lg ml-2' onClick={this.props.onHide}>
                  Cancel
                </button>
              </div> */}
            {/* </form> */}
            
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(CollectionDefaultVersionForm)
