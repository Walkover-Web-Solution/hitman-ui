import React, { useState, useEffect } from 'react';
import jQuery from 'jquery';

const DisplayBodyDescription = (props) => {
  const [body, setBody] = useState(JSON.parse(props.body));
  const [bodyDescription, setBodyDescription] = useState(jQuery.extend(true, {}, props.body_description));

  useEffect(() => {
    setBody(JSON.parse(props.body));
    setBodyDescription(jQuery.extend(true, {}, props.body_description));
  }, [props.body, props.body_description]);

  const performChange = (pkeys, bodyDescription, newValue, body) => {
    if (pkeys.length === 1) {
      const type = bodyDescription[pkeys[0]].type;

      if (type === 'number') {
        bodyDescription[pkeys[0]].value = parseInt(newValue);
        body[pkeys[0]] = parseInt(newValue);
      } else if (type === 'string') {
        bodyDescription[pkeys[0]].value = newValue;
        body[pkeys[0]] = newValue;
      } else if (type === 'boolean') {
        const value = newValue === 'true' ? true : newValue === 'false' ? false : null;
        bodyDescription[pkeys[0]].value = value;
        body[pkeys[0]] = value;
      }
    } else {
      const data = bodyDescription[pkeys[0]].value;
      const bodyData = body[pkeys[0]];

      const result = performChange(pkeys.slice(1), data, newValue, bodyData);
      bodyDescription[pkeys[0]].value = result.bodyDescription;
      body[pkeys[0]] = result.body;
    }
    return { body, bodyDescription };
  };

  const handleChange = (e) => {
    const { name, value } = e.currentTarget;

    const { body: newBody, bodyDescription: newBodyDescription } = performChange(
      makeParentKeysArray(name),
      jQuery.extend(true, {}, bodyDescription),
      value,
      jQuery.extend(true, {}, body)
    );
    setBody(newBody);
    setBodyDescription(newBodyDescription);
    props.set_body_description(newBodyDescription);
  };

  const performDescriptionChange = (pkeys, bodyDescription, value) => {
    if (pkeys.length === 1) {
      bodyDescription[pkeys[0]].description = value;
    } else {
      const data = bodyDescription[pkeys[0]].value;
      bodyDescription[pkeys[0]].value = performDescriptionChange(pkeys.slice(1), data, value);
    }
    return bodyDescription;
  };

  const handleDescriptionChange = (e) => {
    const { name, value } = e.currentTarget;

    const parentKeyArray = name.split('.');
    parentKeyArray.splice(0, 1);
    parentKeyArray.splice(-1, 1);
    const newBodyDescription = performDescriptionChange(parentKeyArray, jQuery.extend(true, {}, bodyDescription), value);
    setBodyDescription(newBodyDescription);
    props.set_body_description(newBodyDescription);
  };

  const displayBoolean = (obj, name) => (
    <div className='value-description-input-wrapper'>
      <input
        className='description-input-field'
        value={obj.description}
        name={`${name}.description`}
        type='text'
        placeholder='Description'
        onChange={handleDescriptionChange}
      />
    </div>
  );

  const displayInput = (obj, name) => (
    <div className='value-description-input-wrapper'>
      <input
        className='description-input-field'
        value={obj.description}
        name={`${name}.description`}
        type='text'
        placeholder='Description'
        onChange={handleDescriptionChange}
      />
    </div>
  );

  const displayArray = (array, name, defaultValue) => {
    const renderTitle = (value, index) => {
      if (value.type === 'array' || value.type === 'object') {
        return (
          <div className='key-title d-flex align-items-center' key={index}>
            <label className='mr-2'>{`[${index}]`}</label>
            <label className='data-type'>{value.type}</label>
            {value.type === 'array' && displayInput(value, `${name}.${index}`)}
          </div>
        );
      }
    };
    return (
      <div className={defaultValue && (defaultValue.type === 'object' || defaultValue.type === 'array') ? 'array-wrapper' : 'array-without-key'}>
        {array.map((value, index) => (
          <div key={index} className='array-row'>
            {renderTitle(value, index)}
            {value.type === 'boolean'
              ? displayBoolean(value, `${name}.${index}`)
              : value.type === 'object'
                ? displayObject(value.value, `${name}.${index}`)
                : value.type === 'array'
                  ? displayArray(value.value, `${name}.${index}`, value.default)
                  : null}
          </div>
        ))}
      </div>
    );
  };

  const displayObject = (obj, name) => {
    if (!obj) {
      return null;
    }
    return (
      <div className='object-container'>
        {typeof obj === 'string' ? (
          <div className='object-container object-error'>{obj}</div>
        ) : (
          Object.keys(obj).map((key) => (
            <div
              key={key}
              className={obj[key].type === 'array' ? 'array-container' : 'object-row-wrapper'}
              style={obj[key].type === 'object' ? { flexDirection: 'column' } : { flexDirection: 'row' }}
            >
              <div className='key-title'>
                <label>{key}</label>
                <label className='data-type'>{obj[key].type}</label>
              </div>
              {displayInput(obj[key], `${name}.${key}`)}
              {obj[key].type === 'object'
                ? displayObject(obj[key].value, `${name}.${key}`)
                : obj[key].type === 'array'
                  ? displayArray(obj[key].value, `${name}.${key}`, obj[key].default)
                  : null}
            </div>
          ))
        )}
      </div>
    );
  };

  const generateBodyFromDescription = (bodyDescription, body) => {
    if (!body) {
      body = {};
    }
    const keys = Object.keys(bodyDescription);
    keys.forEach((key) => {
      switch (bodyDescription[key].type) {
        case 'string':
        case 'number':
        case 'boolean':
          body[key] = bodyDescription[key].value;
          break;
        case 'array':
          body[key] = generateBodyFromDescription(bodyDescription[key].value, []);
          break;
        case 'object':
          body[key] = generateBodyFromDescription(bodyDescription[key].value, {});
          break;
        default:
          break;
      }
    });
    return body;
  };

  const makeParentKeysArray = (name) => {
    const parentKeyArray = name.split('.');
    parentKeyArray.splice(0, 1);
    return parentKeyArray;
  };

  return <div className='body-description-container'>{displayObject(bodyDescription, 'body_description')}</div>;
};

export default DisplayBodyDescription;
