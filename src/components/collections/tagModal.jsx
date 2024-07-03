import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import Form from '../common/form'
import { onEnter } from '../common/utility'

const TagManagerModal = (props) => {

  const [data, setData] = useState({ gtmId: '' })

  useEffect(() => {
    const tempData = { gtmId: '' }
    if (props.collection_id) {
      tempData.gtmId = props.collections[props.collection_id].gtmId
    }

    setData(tempData)
  }, [])


  const doSubmit = async () => {
    const collection = props.collections[props.collection_id]
    const updatedCollection = { ...collection, gtmId: data.gtmId }
    delete updatedCollection?.isPublic
    props.update_collection(updatedCollection)
    props.onHide()
  }


  return (
    <Form doSubmit={doSubmit} >
      {({ handleKeyPress, handleSubmit, renderInput, renderButton }) => (
        <div
          onKeyPress={(e) => {
            onEnter(e, handleKeyPress)
          }}
        >
          <Modal {...props} size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
            <div>
              <Modal.Header className='custom-collection-modal-container' closeButton>
                <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={handleSubmit}>
                  {renderInput('gtmId', 'GTM-ID', 'GTM-ID', true)}
                  <div className='text-left mt-2 mb-2'>
                    {renderButton('Submit')}
                    <button className='btn btn-secondary outline btn-sm fs-4 ml-2' onClick={props.onHide}>
                      Cancel
                    </button>
                  </div>
                </form>
              </Modal.Body>
            </div>
          </Modal>
        </div>
      )}
    </Form>
  )
}


export default TagManagerModal
