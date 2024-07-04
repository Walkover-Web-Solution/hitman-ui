import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import AceEditor from 'react-ace';
import { Dropdown, Col } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { languages, primaryLanguages, secondaryLanguages } from './languages';
import { RiCloseLine } from "react-icons/ri";
import { RiCheckboxMultipleLine } from "react-icons/ri";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import IconButton from '../common/iconButton'
import { hexToRgb, isOnPublishedPage } from '../common/utility'
import { FaChevronRight } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { updateStateOfCurlSlider } from '../modals/redux/modalsActions';
import HTTPSnippet from 'httpsnippet';
import './endpoints.scss';

import 'ace-builds';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-github';

const CodeTemplate = (props) => {

  const dispatch = useDispatch();

  const params = useParams()

  const [theme, setTheme] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [copied, setCopied] = useState(false);
  const [editorHeight, setEditorHeight] = useState('');
  const [curlSlider, setCurlSlider] = useState(true);

  const selectedLanguageRef = useRef('shell');
  const codeTemplateRef = useRef();

  useEffect(() => {
    if (props.harObject) {
      makeCodeTemplate(selectedLanguageRef.current);
    }
    if (!theme) {
      setTheme(props.publicCollectionTheme);
    }
  }, [props.harObject, theme, props.publicCollectionTheme]);

  useEffect(() => {
    if (codeSnippet !== '') adjustEditorHeight();
  }, [codeSnippet]);

  function handleButtonClick() {
    setCurlSlider(!curlSlider);
    dispatch(updateStateOfCurlSlider(!curlSlider))
  }

  const makeCodeSnippet = () => {
    const { method, url, httpVersion, cookies, headers, postData } = props.harObject;
    const snippet = new HTTPSnippet({
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData
    });
    return snippet;
  };

  const makeCodeTemplate = (selectedLanguage) => {
    const { harObject } = props;
    if (!harObject || !harObject.method) return;

    selectedLanguageRef.current = selectedLanguage;
    const selectedLanguageNameselectedLanguageName = languages[selectedLanguage].name;
    let generatedCodeSnippet = '';

    try {
      const snippet = makeCodeSnippet();
      if (selectedLanguage === 'axiosNode') {
        generatedCodeSnippet = snippet.convert('node', 'axios');
      } else {
        generatedCodeSnippet = snippet.convert(selectedLanguage);
      }
      generatedCodeSnippet = decodeURI(generatedCodeSnippet);
    } catch (error) {
      console.error(error);
    }

    setCodeSnippet(generatedCodeSnippet);
    setCopied(false);
  };

  const handleCloseClick = () => {
    props.updateCurlSlider(false);
  };

  const getClassForLanguages = (key) => {
    const commonClass = 'mr-2 d-flex d-md-flex flex-column justify-content-center align-items-center';
    let classToReturn = key === selectedLanguageRef.current ? 'active ' + commonClass : commonClass;
    return props.theme !== 'light' ? classToReturn + ' ' : classToReturn;
  };

  const adjustEditorHeight = () => {
    if (codeTemplateRef.current) {
      const editor = codeTemplateRef.current.editor;
      const newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth();
      setEditorHeight(`${newHeight}px`);
    }
  };

  return (
    <>
      <div className='d-flex position-relative'>
        {isOnPublishedPage() && (
          <button
            onClick={handleButtonClick}
            className={`pubCode-icon btn mt-4 position-absolute rounded-circle px-1 py-0 bg-white${props.curlSlider ? ' active' : ''}`}
          >
            <FaChevronRight size={12} />
          </button>)}
        <div className={params.endpointId ? 'show-curl-endpoint pubCodeWrapper' : props?.curlSlider ? 'pubCodeWrapper-hide pubCodeWrapper' : 'pubCodeWrapper'} style={{ backgroundColor: hexToRgb(theme, '0.04') }}>
          <div className='inner-editor'>
            <Col id='code-window-sidebar' xs={12} className='px-3 pt-3 pb-1 col-12'>
              <div className='code-heading mb-3 d-flex align-items-center'>
                <span className={props.theme === 'light' ? 'col-black' : 'col-black'}>Sample code</span>
                {props.showClosebtn && (
                  <div className='d-flex justify-content-end flex-grow-1'>
                    <IconButton>
                      <RiCloseLine color='black' className='cur-pointer' onClick={handleCloseClick} />
                    </IconButton>
                  </div>
                )}
              </div>
              <div className='select-code-wrapper d-flex align-items-center mb-3 img'>
                {primaryLanguages.map((key) => (
                  <button
                    key={key}
                    className={`${params.endpointId ? "btn btn-outline-dark" : ""} ${getClassForLanguages(key)}`}
                    onClick={() => {
                      makeCodeTemplate(key);
                    }}
                  >
                    <img src={languages[key].imagePath} alt={languages[key].name} width={15} />
                    {languages[key].name}
                  </button>
                ))}
                <Dropdown>
                  <Dropdown.Toggle className={secondaryLanguages.includes(selectedLanguageRef.current) ? 'active dropdownMore mr-0' : 'dropdownMore mr-0'}>
                    {primaryLanguages.includes(selectedLanguageRef.current) ? (
                      <span><BsThreeDotsVertical /></span>
                    ) : (
                      <span>{languages[selectedLanguageRef.current].name}</span>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {secondaryLanguages.map((key) => (
                      <Dropdown.Item
                        key={key}
                        className={key === selectedLanguageRef.current ? 'active mb-2 mt-2' : 'mb-2 mt-2'}
                        onClick={() => {
                          makeCodeTemplate(key);
                        }}
                      >
                        <img src={languages[key].imagePath} alt={languages[key].name} className='mr-2' />
                        {languages[key].name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
            <Col className={isOnPublishedPage() ? 'editor-body-wrapper' : 'editor-body-wrapper editor-body-wrapper-height'} xs={12}>
              <div className='ace-editor-wrapper'>
                <div id='code-window-body' className={!isOnPublishedPage() ? 'copy-button-light' : 'copy-button-dark'}>
                  <CopyToClipboard
                    text={codeSnippet ? codeSnippet : ''}
                    onCopy={() => setCopied(true)}
                    className='copy-to-clipboard mt-1'
                  >
                    <button>{copied ? <IconButton> <RiCheckboxMultipleLine color={props.theme === 'light' ? 'black' : "white"} /> </IconButton> : <IconButton><RiCheckboxMultipleBlankLine className='cur-pointer' color={props.theme === 'light' ? 'black' : "white"} /></IconButton>}</button>
                  </CopyToClipboard>
                </div>
                <AceEditor
                  height={editorHeight}
                  ref={codeTemplateRef}
                  mode={languages[selectedLanguageRef.current].mode}
                  theme={props.theme === 'light' ? 'kuroir' : "tomorrow_night"}
                  highlightActiveLine={false}
                  focus={false}
                  value={codeSnippet ? codeSnippet : ''}
                  readOnly
                  editorProps={{
                    $blockScrolling: false
                  }}
                  showGutter={false}
                  onLoad={(editor) => {
                    editor.getSession().setUseWrapMode(true);
                    editor.setShowPrintMargin(false);
                  }}
                />
                <div id='code-window-body' className={!isOnPublishedPage() ? 'empty-div-light' : 'empty-div-dark'}></div>
              </div>
            </Col>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodeTemplate;
