import React, { useState, useEffect } from 'react';
import './publicEndpoint.scss';
import DisplayBodyDescription from './displayBodyDescription';
import bodyDescriptionService from './bodyDescriptionService';
import { rawTypesEnums } from '../common/bodyTypeEnums';

const BodyDescription = (props) => {
  const [bodyDescription, setBodyDescription] = useState(null);

  useEffect(() => {
    if (bodyDescriptionService.parseBody(props.body)) {
      bodyDescriptionService.handleUpdate(false, props);
    } else {
      if (props.body === '') {
        bodyDescriptionService.handleUpdate(true, props, 'Empty json body');
      } else {
        bodyDescriptionService.handleUpdate(true, props, 'Please Enter Valid JSON');
      }
    }
  }, [props.body]); // Dependency array to run effect when props.body changes

  return (
    <div>
      {props.body_type === rawTypesEnums.JSON && (
        <div>
          <DisplayBodyDescription body_description={props.body_description} {...props} />
        </div>
      )}
    </div>
  );
};

export default BodyDescription;
