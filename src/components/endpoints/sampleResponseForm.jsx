import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import AceEditor from 'react-ace'
import Form from '../common/form'


const SampleResponseForm = (props) => {
  const [data, setData] = useState({ status: '', description: '', body: '', title: '' });
  const [errors, setErrors] = useState({});
  const schema = {
    title: Joi.string().required().max(5).label('Title'),
    status: Joi.number().min(100).max(599).label('Status'),
    description: Joi.string().allow(null, '').label('Description'),
    body: Joi.string().max(2000).allow(null, '', 'null').label('Body')
  };

  useEffect(() => {
    if (props.selectedSampleResponse) {
      let { title, status, description, data: body } = props.selectedSampleResponse;
      body = JSON.stringify(body, null, 2);
      setData({ title, status: status ? String(status) : '', description, body });
    }
  }, [props.selectedSampleResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkDuplicateName()) {
      props.onHide();
      if (props.title === 'Add Sample Response') {
        addSampleResponse();
      } else if (props.title === 'Edit Sample Response') {
        editSampleResponse();
      }
    }
  };

  const handleChange = ({ currentTarget: input }) => {
    const newData = { ...data };
    newData[input.name] = input.value;
    setData(newData);
  };

  const editSampleResponse = () => {
    let { status, description, body, title } = data;
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = null;
    }
    const index = props.index;
    const sampleResponse = { status, description, data: body, title };
    const sampleResponseArray = [...props.endpointContent.sampleResponseArray];
    const sampleResponseFlagArray = [...props.sample_response_flag_array];
    sampleResponseArray[index] = sampleResponse;
    props.props_from_parent(sampleResponseArray, sampleResponseFlagArray);
  };

  const addSampleResponse = () => {
    let { title, status, description, body } = data;
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = null;
    }
    const sampleResponse = { title, status, description, data: body };
    const sampleResponseArray = [...props.endpointContent.sampleResponseArray, sampleResponse];
    const sampleResponseFlagArray = [...props.sample_response_flag_array, false];
    props.props_from_parent(sampleResponseArray, sampleResponseFlagArray);
  };

  const checkDuplicateName = () => {
    if (props && props.endpoints) {
      const usedTitles = [];
      const sampleResponse = props.endpointContent.sampleResponseArray || [];
      sampleResponse.forEach((key) => usedTitles.push(key.title));

      if (props.title === 'Edit Sample Response') {
        usedTitles.splice(usedTitles.indexOf(sampleResponse[props.index].title), 1);
      }

      if (usedTitles.includes(data.title)) {
        setErrors({ ...errors, title: 'Title must be unique' });
        return false;
      } else return true;
    }
  };

  const renderInput = (name, label, placeholder, isRequired = false, readOnly = false) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        value={data[name]}
        onChange={handleChange}
        id={name}
        name={name}
        type="text"
        className="form-control"
        placeholder={placeholder}
        required={isRequired}
        readOnly={readOnly}
      />
      {errors[name] && <div className="alert alert-danger">{errors[name]}</div>}
    </div>
  );

  const handleAceEditorChange = (value) => {
    data.body = value
    setData({ ...data, body: value })
  }

  const renderAceEditor = (name, label) => {

    return (
      <div className='form-group '>
        <label htmlFor={name} className='custom-input-label'>
          {label}
        </label>
        <AceEditor
          style={{ border: '1px solid rgb(206 213 218)' }}
          className='custom-raw-editor'
          mode='json'
          theme='github'
          value={data.body}
          onChange={handleAceEditorChange}
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
        />
        <small className='muted-text'>*Body should not exceed more than 2000 characters.</small>
        {errors[name] && <div className='alert alert-danger'>{errors[name]}</div>}
      </div>
    )
  }

  const renderButton = (label, style) => {
    return (
      <button className='btn btn-primary btn-sm fs-4' id='add_collection_create_new_btn'>
        {label}
      </button>
    )
  }


  return (
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
          {renderInput('title', 'Title: ', 'Enter Title')}
          {renderInput('status', 'Status: ', 'Enter Status')}
          {renderInput('description', 'Description: ', 'Enter Description')}
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
  );
};

export default SampleResponseForm;