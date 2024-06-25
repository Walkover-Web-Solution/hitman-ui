import React, { useState, useEffect } from 'react';
import { isDashboardRoute } from '../common/utility';
import { updateEndpoint } from '../pages/redux/pagesActions';
import { connect } from 'react-redux';
import './endpointBreadCrumb.scss';
import EndpointBreadCrumb from './endpointBreadCrumb';

const mapDispatchToProps = (dispatch) => {
  return {
    update_endpoint: (editedEndpoint) => dispatch(updateEndpoint(editedEndpoint)),
  };
};

const DisplayDescription = (props) => {
  const [showDescriptionFormFlag, setShowDescriptionFormFlag] = useState(false);
  const [showAddDescriptionFlag, setShowAddDescriptionFlag] = useState(
    isDashboardRoute(props) ? !!(props.endpoint.description === '' || props.endpoint.description == null) : false
  );
  const [theme, setTheme] = useState('');

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ],
  };

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'list', 'bullet', 'link'];

  const handleChange = (e) => {
    const data = { ...props.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    props.props_from_parent('data', data);
  };

  useEffect(() => {
    if (!theme) {
      setTheme(props.publicCollectionTheme);
    }
  }, [theme, props.publicCollectionTheme]);

  const handleDescription = () => {
    setShowDescriptionFormFlag(true);
    setShowAddDescriptionFlag(false);
  };

  const handleDescriptionCancel = () => {
    const endpoint = { ...props.endpoint };
    endpoint.description = props.old_description;
    setShowDescriptionFormFlag(false);
    setShowAddDescriptionFlag(true);
    props.props_from_parent('endpoint', endpoint);
  };

  const handleDescriptionSave = (e) => {
    e.preventDefault();
    const value = props.endpoint.description;
    const endpoint = { ...props.endpoint };
    props.update_endpoint({ id: endpoint.id, description: value });
    endpoint.description = value;
    setShowDescriptionFormFlag(false);
    setShowAddDescriptionFlag(true);
    props.props_from_parent('endpoint', endpoint);
    props.props_from_parent('oldDescription', value);
  };

  const handleChangeDescription = (value) => {
    const endpoint = { ...props.endpoint };
    endpoint.description = value;
    props.props_from_parent('endpoint', endpoint);
  };

  return (
    <div className='endpoint-header'>
      <div className={isDashboardRoute(props) ? 'panel-endpoint-name-container' : 'endpoint-name-container'}>
        {isDashboardRoute(props) && <>{props.endpoint && <EndpointBreadCrumb {...props} isEndpoint />}</>}
      </div>
    </div>
  );
};

export default connect(null, mapDispatchToProps)(DisplayDescription);
