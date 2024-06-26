import React, { useEffect, useRef, useState } from 'react';
import Joi from 'joi-browser';
import { connect } from 'react-redux';
import Form from '../common/form';
import './endpoints.scss';
import ShowCaseSaveAsModal from './showCaseSaveAsModal/showCaseSaveAsModal';
import Input from '../common/input';
import { trimString } from '../common/utility';
import IconButtons from '../common/iconButton';
import { MdOutlineClose } from "react-icons/md";

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
  };
};

const SaveAsSidebar = (props) => {
  const [data, setData] = useState({
    name: '',
    description: '',
  });
  const saveAsSidebar = useRef(null);
  const inputRef = useRef(null);

  const schema = {
    name: Joi.string().required().label('Endpoint Name'),
    description: Joi.string().allow(null, '').label('Description'),
  };

  useEffect(() => {
    const newData = { ...data, name: props?.name };
    setData(newData);
  }, [props?.name]);

  const handleEndpointNameChange = (e) => {
    const dummyData = { ...props?.endpointContent };
    dummyData.data.name = e.currentTarget.value;
    props.setQueryUpdatedData(dummyData);
  };

  const handleEndpointNameBlur = (e) => {
    if (!trimString(e.currentTarget.value)) {
      if (props?.match?.params?.endpointId !== 'new') {
        props.setQueryUpdatedData({
          ...props.endpointContent,
          data: {
            ...props.endpointContent.data,
            name: props.pages?.[props?.match?.params?.endpointId]?.name || '',
          },
        });
      } else {
        props.setQueryUpdatedData({
          ...props.endpointContent,
          data: { ...props.endpointContent.data, name: 'Untitled' },
        });
      }
    }
  };

  const handleEndpointSaveAsEndpointNameChange = (e) => {
    setData({ ...data, name: e.currentTarget.value });
  };

  const handleSaveAsEndpointNameBlur = (e) => {
    if (!trimString(e.currentTarget.value)) {
      setData({ ...data, name: props?.endpointContent?.data?.name });
    }
  };

  const renderEndpointNameInput = () => {
    return (
      <Input
        ref={inputRef}
        value={props?.endpointContent?.data?.name || ''}
        onChange={handleEndpointNameChange}
        onBlur={handleEndpointNameBlur}
        placeholder={'Endpoint Name'}
        mandatory={'mandatory'}
        firstLetterCapitalize
        label={'Name'}
      />
    );
  };

  const renderSaveAsExistingEndpointInput = () => {
    return (
      <Input
        value={data.name}
        onChange={handleEndpointSaveAsEndpointNameChange}
        onBlur={handleSaveAsEndpointNameBlur}
        placeholder={'Endpoint Name'}
        mandatory={'mandatory'}
        firstLetterCapitalize
        label={'Name'}
      />
    );
  };

  const title = data.name;
  const saveAsSidebarStyle = {
    position: 'fixed',
    background: 'white',
    zIndex: '1050',
    top: '0px',
    right: '0px',
    height: '100vh',
    width: '35vw',
    boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)',
    overflow: 'hidden',
  };

  return (
    <div
      tabIndex={-1}
      ref={saveAsSidebar}
      style={saveAsSidebarStyle}
      className='save-as-sidebar-container'
    >
      <div className='custom-collection-modal-container modal-header align-items-center'>
        <div className='modal-title h4'>{props.location.pathname.split('/')[5] !== 'new' ? 'Save As' : 'Save'}</div>
        <IconButtons>
          <MdOutlineClose
            className='fs-2'
            onClick={props.onHide}
          />
        </IconButtons>
      </div>
      <div className='drawer-body'>
        <form className='desc-box form-parent' onSubmit={props.handleSubmit}>
          <div className='p-form-group mb-3'>
            {props?.match?.params?.endpointId === 'new'
              ? renderEndpointNameInput()
              : renderSaveAsExistingEndpointInput()}
            {title?.trim() === '' || title === 'Untitled' ? (
              <small className='text-danger'>Please enter the Title</small>
            ) : (
              <div />
            )}
          </div>
        </form>
        <ShowCaseSaveAsModal
          save_endpoint={props.save_endpoint}
          name={data.name}
          description={data.description}
          onHide={props.onHide}
        />
      </div>
    </div>
  );
};

export default connect(mapStateToProps, null)(SaveAsSidebar);
