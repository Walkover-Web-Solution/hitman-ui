import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'

const SampleResponseForm = (props) => {

  const [data, setData] = useState({ status: '', description: '', body: '', title: '' });
  const [errors, setErrors] = useState({});


  const schema = {
    title: Joi.string().required().max(5).label('Title: '),
    status: Joi.number().min(100).max(599).label('Status: '),
    description: Joi.string().allow(null, '').label('Description: '),
    body: Joi.string().max(2000).allow(null, '', 'null').label('Body: '),
  };

  const editSampleResponse = () => {
    let { status, description, body: data, title } = data;
    try {
      data = JSON.parse(data);
    } catch (error) {
      data = null;
    }
    const index = props.index;
    const sampleResponse = { status, description, data, title };
    const sampleResponseArray = [...props.endpointContent.sampleResponseArray];
    const sampleResponseFlagArray = [...props.sample_response_flag_array];
    sampleResponseArray[index] = sampleResponse;
    props.props_from_parent(sampleResponseArray, sampleResponseFlagArray);
  };


  const addSampleResponse = () => {
    let { title, status, description, body: data } = data;
    try {
      data = JSON.parse(data);
    } catch (error) {
      data = null;
    }

    const sampleResponse = { title, status, description, data };
    const sampleResponseArray = [...props.endpointContent.sampleResponseArray, sampleResponse];
    const sampleResponseFlagArray = [...props.sample_response_flag_array, false];
    props.props_from_parent(sampleResponseArray, sampleResponseFlagArray);
  };

  const doSubmit = () => {
    if (checkDuplicateName()) {
      props.onHide();
      if (props.title === 'Add Sample Response') {
        addSampleResponse();
      }
      if (props.title === 'Edit Sample Response') {
        editSampleResponse();
      }
    }
  };


  const checkDuplicateName = () => {
    if (props && props.endpoints) {
      const usedTitles = [];
      const sampleResponse = props.endpointContent.sampleResponseArray || [];
      sampleResponse.forEach((key) => {
        usedTitles.push(key.title);
      });

      if (props.title === 'Edit Sample Response') {
        usedTitles.splice(usedTitles.indexOf(sampleResponse[props.index].title), 1);
      }

      if (usedTitles.includes(data.title)) {
        setErrors({ ...errors, title: 'Title must be unique' });
        return false;
      } else return true;
    }
  };

  return (
    <Form doSubmit={doSubmit}>
      {({ renderInput, renderTextArea, renderButton, renderAceEditor, handleSubmit }) => (
        <Modal
          show={props.show}
          onHide={props.onHide}
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
          className='custom-collection'
        >
          <Modal.Header className='custom-collection-modal-container p-3' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className='p-3'>
            <form onSubmit={handleSubmit}>
              {renderInput('title', 'Title: ', 'Enter Title ', false, false, false)}
              {renderInput('status', 'Status: ', 'Enter Status ', false, false, false)}
              {renderInput('description', 'Description: ', 'Enter Descripton')}
              {renderAceEditor('body', 'Body: ')}
              <div className='text-right mt-2 mb-2'>
                <button className='btn btn-secondary outline btn-sm fs-4 mr-2' onClick={props.onHide}>
                  Cancel
                </button>
                {renderButton('Submit')}
              </div>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </Form>
  )
}

export default SampleResponseForm
