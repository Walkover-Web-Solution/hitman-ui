import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import Form from '../../common/form'
import { onEnter } from '../../common/utility'
import { connect } from 'react-redux'
import DefaultViewModal from '../../collections/defaultViewModal/defaultViewModal'
import { addPage } from '../../pages/redux/pagesActions'

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_page: (rootParentId, newPage) => dispatch(addPage(ownProps.history, rootParentId, newPage))
  }
}

const PageEndpointForm = (props) => {

  const [viewLoader, setViewLoader] = useState(false)                // initial value?

  const renderDefaultViewForm = () => {
    return (
      <DefaultViewModal
        viewLoader={viewLoader}
        // saveCollection={saveCollection}                           // revisit
        onHide={() => props.onHide()}
      />
    )
  }

  const renderForm = () => {
    // const { step } = this.statecp                                                   revisit
    return <>{step === 1 && renderDefaultViewForm()}</>
  }

  const renderInModal = () => {
    return (
      <Form>
        {({ handleKeyPress }) => (
          <div
            onKeyPress={(e) => {
              onEnter(e, handleKeyPress)
            }}
          >
            <Modal
              size='sm'
              animation={false}
              aria-labelledby='contained-modal-title-vcenter'
              centered
              onHide={props.onHide}
              show={props.show}
            >
              <div>
                <Modal.Header className='custom-collection-modal-container' closeButton>
                  <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{renderForm()}</Modal.Body>
              </div>
            </Modal>
          </div>
        )}
      </Form>
    )
  }


  return props.showOnlyForm ? renderForm() : renderInModal()

}

export default connect(mapStateToProps, mapDispatchToProps)(PageEndpointForm)


// removed:
// async onAddPageSubmit(props) {
//     let { name } = { ...this.state.data }
//     name = toTitleCase(name)
//     const collections = this.props.selectedCollection

//     const rootParentId = this.props.addEntity ? collections : this.props.collections.rootParentId
//     const data = { ...this.state.data, name }
//     const newPage = {
//       ...data,
//       requestId: shortid.generate(),
//       versionId: this.props.pageType === 1 ? shortid.generate() : null,
//       pageType: this.props.pageType
//     }
//     this.props.add_page(rootParentId, newPage)
//     moveToNextStep(1)
//   }



//   handleCancel(e) {
//     e.preventDefault()
//     this.props.showOnlyForm ? this.props.onCancel() : this.props.onHide()
//   }