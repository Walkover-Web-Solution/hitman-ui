import 'ace-builds';
import React, { useState, useEffect, useRef } from 'react';
import GenericTable from './genericTable';
import AceEditor from 'react-ace';
import { willHighlight } from './highlightChangesHelper';
import './publicEndpoint.scss';
import { Badge } from 'react-bootstrap';
import { bodyTypesEnums, rawTypesEnums } from '../common/bodyTypeEnums';
import { hexToRgb, isOnPublishedPage } from '../common/utility';
import { background } from '../backgroundColor.js';

const PublicBodyContainer = (props) => {
  const [theme, setTheme] = useState({
    publicCollectionTheme: props.publicCollectionTheme,
    backgroundStyle: {},
  });
  const [showBodyCodeEditor, setShowBodyCodeEditor] = useState(true);
  const [data, setData] = useState({
    data: [
      {
        checked: 'notApplicable',
        key: '',
        value: '',
        description: '',
        type: 'text',
      },
    ],
    urlencoded: [
      {
        checked: 'notApplicable',
        key: '',
        value: '',
        description: '',
        type: 'text',
      },
    ],
  });

  const queryRef = useRef();
  const variablesRef = useRef();

  useEffect(() => {
    const initialData = {
      data: props?.body?.[bodyTypesEnums['multipart/form-data']] || [
        { checked: 'notApplicable', key: '', value: '', description: '', type: 'text' },
      ],
      urlencoded: props?.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] || [
        { checked: 'notApplicable', key: '', value: '', description: '', type: 'text' },
      ],
    };
    setData(initialData);
    updateBackgroundStyle();
  }, [props.body]);

  const updateBackgroundStyle = () => {
    const dynamicColor = hexToRgb(theme.publicCollectionTheme, 0.02);
    const staticColor = background['backgroound_boxes'];

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `,
    };

    setTheme((prevState) => ({
      ...prevState,
      backgroundStyle,
    }));
  };

  const handleChangeBody = (title, dataArray) => {
    const newData = { ...data };
    switch (title) {
      case 'formData':
        newData.data = dataArray;
        setData(newData);
        props.set_body(bodyTypesEnums['multipart/form-data'], dataArray);
        break;
      case 'x-www-form-urlencoded':
        newData.urlencoded = dataArray;
        setData(newData);
        props.set_body(bodyTypesEnums['application/x-www-form-urlencoded'], dataArray);
        break;
      default:
        break;
    }
  };

  const setBody = (data) => {
    props.set_body_description(data.bodyDescription);
    props.set_public_body(data.body);
  };

  const handleChangeBodyDescription = (data) => {
    try {
      const body = data;
      const bodyData = {
        bodyDescription: bodyDescription,
        body: body,
      };
      setBody(bodyData);
    } catch (e) {
      console.error('Error beautifying data:', e);
    }
  };

  const makeJson = (body) => {
    try {
      const parsedBody = JSON.stringify(JSON.parse(body), null, 2);
      return parsedBody;
    } catch (e) {
      return body;
    }
  };

  const displayBodyDescription = (parentPath = '', object) => {
    if (!object) {
      return null;
    }

    const displayLegend = () => {
      const types = ['string', 'number', 'boolean', 'array', 'object'];
      return (
        <div className='d-flex flex-row-reverse'>
          {types.map((type, index) => (
            <small key={index} className='ml-3 text-small'>
              <Badge className={`body-desc-type ${type}`}>{type.charAt(0)}</Badge> <span className='text-capitalize'>{type}</span>
            </small>
          ))}
        </div>
      );
    };

    const renderType = (type) => {
      return (
        <Badge className={`body-desc-type ${type}`} style={{ cursor: 'default' }}>
          {type.charAt(0)}
        </Badge>
      );
    };

    const renderItem = (parentPath, key, value) => {
      const path = parentPath ? `${parentPath}.${key}` : key;
      return (
        <div key={path} className='py-1'>
          {renderType(value.type)}
          <strong className='pl-1' style={{ cursor: 'default' }}>
            {key}
          </strong>
          <span>{value.description ? ` : ${value.description}` : ''}</span>
        </div>
      );
    };

    const renderObject = (parentPath, obj) => {
      return Object.entries(obj).map(([key, value]) => {
        const newPath = parentPath ? `${parentPath}.${key}` : key;
        if (['object', 'array'].includes(value.type)) {
          return (
            <div key={newPath} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>
              <strong className='pl-1' style={{ cursor: 'default' }}>
                {value.type === 'object' ? <Badge className='body-desc-type object'>O</Badge> : null}
                {value.type === 'array' ? <Badge className='body-desc-type array'>A</Badge> : null} {key}
              </strong>
              {value.type === 'object' ? renderObject(newPath, value.value) : null}
              {value.type === 'array' ? renderArray(newPath, value.value) : null}
            </div>
          );
        } else {
          return renderItem(newPath, key, value);
        }
      });
    };

    const renderArray = (parentPath, arr) => {
      return arr.map((item, index) => {
        const newPath = `${parentPath}[${index}]`;
        if (['object', 'array'].includes(item.type)) {
          return (
            <div key={newPath} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>
              <strong className='pl-1' style={{ cursor: 'default' }}>
                {item.type === 'object' ? <Badge className='body-desc-type object'>O</Badge> : null}
                {item.type === 'array' ? <Badge className='body-desc-type array'>A</Badge> : null} Item {index}
              </strong>
              {item.type === 'object' ? renderObject(newPath, item.value) : null}
              {item.type === 'array' ? renderArray(newPath, item.value) : null}
            </div>
          );
        } else {
          return renderItem(newPath, index.toString(), item);
        }
      });
    };

    return (
      <div className='public'>
        {renderObject('', object)}
        <hr />
        {displayLegend()}
      </div>
    );
  };

  const handleSetQueryData = () => {
    props.setQueryTabBody({
      query: queryRef.current.editor.getValue(),
      variables: variablesRef.current.editor.getValue(),
    });
  };

  const graphqlBody = () => {
    const editorOptions = {
      markers: false,
      showGutter: false,
    };
    return (
      <div className='hm-public-table'>
        {props.endpointContent?.data?.body?.query && (
          <div className='mt-3'>
            <div className='public-generic-table-title-container'>Query</div>
            <AceEditor
              ref={queryRef}
              className={`${isOnPublishedPage() ? 'custom-raw-editor-public' : 'custom-raw-editor'}`}
              mode={'json'}
              theme='github'
              style={theme.backgroundStyle}
              value={props.endpointContent?.data?.body?.query || ''}
              onChange={handleSetQueryData}
              setOptions={{
                showLineNumbers: true,
              }}
              editorProps={{
                $blockScrolling: false,
              }}
              onLoad={(editor) => {
                editor.focus();
                editor.getSession().setUseWrapMode(true);
                editor.setShowPrintMargin(false);
              }}
              enableLiveAutocompletion
              enableBasicAutocompletion
              {...editorOptions}
            />
          </div>
        )}
        {props.endpointContent?.data?.body?.variables && (
          <div className='mt-3'>
            <div className='public-generic-table-title-container'>Variables</div>
            <AceEditor
              ref={variablesRef}
              className={`${isOnPublishedPage() ? 'custom-raw-editor-public' : 'custom-raw-editor'}`}
              mode={'json'}
              theme='github'
              style={theme.backgroundStyle}
              value={props.endpointContent?.data?.body?.variables || ''}
              onChange={handleSetQueryData}
              setOptions={{
                showLineNumbers: true,
              }}
              editorProps={{
                $blockScrolling: false,
              }}
              onLoad={(editor) => {
                editor.focus();
                editor.getSession().setUseWrapMode(true);
                editor.setShowPrintMargin(false);
              }}
              enableLiveAutocompletion
              enableBasicAutocompletion
              {...editorOptions}
            />
          </div>
        )}
      </div>
    );
  };

  const bodyDescription = props.body_description;

  if (props.body && props.endpointContent?.protocolType === 2) return graphqlBody();
  if (props.body && props.body.type === 'none') return null;

  return (
    <>
      {props.body && props.body.type === bodyTypesEnums['multipart/form-data'] && (
        <GenericTable
          {...props}
          title='formData'
          dataArray={data.data}
          handle_change_body_data={handleChangeBody}
          original_data={data.data}
        />
      )}

      {props.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] && props.body.type === bodyTypesEnums['application/x-www-form-urlencoded'] && (
        <GenericTable
          {...props}
          title='x-www-form-urlencoded'
          dataArray={data.urlencoded}
          handle_change_body_data={handleChangeBody}
          original_data={data.urlencoded}
        />
      )}

      {props.body?.[bodyTypesEnums['multipart/form-data']] &&
        props.body.type !== bodyTypesEnums['multipart/form-data'] &&
        props.body.type !== bodyTypesEnums['application/x-www-form-urlencoded'] &&
        (props.body.type === rawTypesEnums.JSON ? (
          <div className='hm-public-table mb-4'>
            <div className='public-generic-table-title-container'>
              Body <small className='text-muted'>({props.body.type})</small> {willHighlight(props, 'body') ? <i className='fas fa-circle' /> : null}
            </div>
            <ul className='public-endpoint-tabs'>
              <li
                className={showBodyCodeEditor ? 'active' : ''}
                style={showBodyCodeEditor ? { backgroundColor: props.publicCollectionTheme } : {}}
                onClick={() => setShowBodyCodeEditor(true)}
              >
                Raw
              </li>
              <li
                className={!showBodyCodeEditor ? 'active' : ''}
                style={!showBodyCodeEditor ? { backgroundColor: props.publicCollectionTheme } : {}}
                onClick={() => setShowBodyCodeEditor(false)}
              >
                Body description
              </li>
            </ul>
            {showBodyCodeEditor ? (
              <AceEditor
                className={`${isOnPublishedPage() ? 'custom-raw-editor-public' : 'custom-raw-editor'}`}
                mode='json'
                style={theme.backgroundStyle}
                theme='github'
                value={props.body?.raw?.value}
                onChange={handleChangeBodyDescription}
                setOptions={{
                  showLineNumbers: true,
                }}
                editorProps={{
                  $blockScrolling: false,
                }}
                onLoad={(editor) => {
                  editor.getSession().setUseWrapMode(true);
                  editor.setShowPrintMargin(false);
                }}
              />
            ) : (
              <div className='body-description-container' style={theme.backgroundStyle}>
                {displayBodyDescription(undefined, bodyDescription)}
              </div>
            )}
          </div>
        ) : (
          <div className='hm-public-table'>
            <div className='public-generic-table-title-container'>
              Body <small className='text-muted'>({props.body.type})</small> {willHighlight(props, 'body') ? <i className='fas fa-circle' /> : null}
            </div>
            <AceEditor
              className='custom-raw-editor'
              mode={props.body.type.toLowerCase()}
              theme='github'
              value={makeJson(props.body?.raw?.value || '')}
              onChange={(value) => props.set_body(props.body.type, value)}
              setOptions={{
                showLineNumbers: true,
              }}
              editorProps={{
                $blockScrolling: false,
              }}
              onLoad={(editor) => {
                if (window.innerWidth > 425) {
                  editor.focus();
                }
                editor.getSession().setUseWrapMode(true);
                editor.setShowPrintMargin(false);
              }}
            />
          </div>
        ))}
    </>
  );
};

export default PublicBodyContainer;
