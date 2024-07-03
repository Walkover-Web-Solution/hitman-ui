import Joi from 'joi-browser'
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import Form from '../common/form'
import { onEnter, ADD_GROUP_MODAL_NAME, validate, getOnlyUrlPathById, getUrlPathById } from '../common/utility'
// import { onEnter, ADD_GROUP_MODAL_NAME, validate } from '../common/utility'
import { updatePage } from '../pages/redux/pagesActions'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (page) => dispatch(updatePage(ownProps.history, page))
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    pages: state.pages
  }
}

const SubPageForm = (props) => {

  const [data, setData] = useState({
    name: '',
    urlName: '',
    prevUrlName: '',
  })

  const [errors, setErrors] = useState({})
  const schema = {
    name: Joi.string().min(1).max(100).required().label('Name'),
    urlName: Joi.string()
      .optional()
      .allow(/[^a-zA-Z0-9\-_\.~]+/g)
  }

  useEffect(() => {
    const subPage = props?.pages?.[props?.selectedPage]
    const endpoint = props?.endpoints?.[props?.selectedEndpoint]

    if (props.title === ADD_GROUP_MODAL_NAME) return
    let data = {}
    if (props.selectedPage || props.selectedEndpoint) {
      const name = subPage?.name || endpoint?.name
      const urlName = subPage?.urlName || endpoint?.urlName
      data = { name, urlName, prevUrlName: urlName }
    }
    setData(data)
  }, [])


  const getPrevUrlName = (id) => {
    const path = getUrlPathById(id, props.pages)
    const questionMarkIndex = path.indexOf('?');
    if (questionMarkIndex === -1) return path
    if (questionMarkIndex === 0) return null;
    const actualPath = path.substring(0, questionMarkIndex);
    return actualPath
  }

  const doSubmit = async () => {
    const errors = validate({ name: data.name }, schema)
    if (errors) {
      setErrors(errors)
      return null
    }
    props.onHide()
    let { name, urlName, prevUrlName } = { ...data }

    if (this.props.title === 'Rename') {
      const subPage = props?.pages?.[props.selectedPage]
      const endpoint = props?.endpoints?.[props.selectedEndpoint]
      const path = getPrevUrlName(props.selectedPage);
      const editedPage = {
        prevUrlName: path ?? prevUrlName,
        name,
        urlName,
        urlMappingFlag: (data.prevUrlName === data.urlName) ? false : true,
        id: subPage?.id || endpoint?.id,
        state: subPage?.state || endpoint?.state,
        collectionId: subPage?.collectionId,
      }
      props.update_page(editedPage)
    }
  }

  const nameTitle = props.isEndpoint ? 'Endpoint Name' : 'Page Name'
  const redirectUrl = ' Enter URL'
  const pageSlug = 'Page Slug'
  const tagLine = getOnlyUrlPathById(
    props?.match?.params?.pageId || props?.match?.params?.endpointId,
    props.pages,
    'internal'
  )


  if (props.title === 'Rename') {
    return (
      <Form doSubmit={doSubmit}>
        {({ handleKeyPress, renderInput, renderButton, handleSubmit }) => (
          <div
            onKeyPress={(e) => {
              onEnter(e, handleKeyPress)
            }}
          >
            <Modal
              show={props.show}
              onHide={props.onHide}
              size='lg'
              animation={false}
              aria-labelledby='contained-modal-title-vcenter'
            >
              <Modal.Header className='custom-collection-modal-container' closeButton>
                <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={handleSubmit}>
                  <div className='row'>
                    <div className='col-12'>
                      {renderInput('name', 'Name', nameTitle, true, false, false, '*name accepts min 1 & max 100 characters')}
                    </div>
                    <div className='col-12'>
                      {renderInput(
                        'urlName',
                        'URL Name',
                        pageSlug,
                        true,
                        false,
                        false,
                        '*Page slug can only contain alphanumeric values and reserved keywords like - _ . ~'
                      )}
                    </div>
                  </div>

                  <div className='text-left'>
                    {renderButton('Submit')}
                    <button className='btn btn-secondary outline btn-sm fs-4 ml-2' onClick={props.onHide}>
                      Cancel
                    </button>
                  </div>
                </form>
              </Modal.Body>
            </Modal>
          </div>
        )}
      </Form>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(SubPageForm)