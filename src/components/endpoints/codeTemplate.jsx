import './endpoints.scss'
import React, { Component } from 'react'
import { Dropdown, Col } from 'react-bootstrap'
import 'ace-builds'
import AceEditor from 'react-ace'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-tomorrow_night'
import 'ace-builds/src-noconflict/theme-github'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { languages, primaryLanguages, secondaryLanguages } from './languages'
import { RiCloseLine } from "react-icons/ri";
import { RiCheckboxMultipleLine } from "react-icons/ri";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import IconButton from '../common/iconButton'
import { BsThreeDotsVertical } from "react-icons/bs"
import { hexToRgb, isOnPublishedPage } from '../common/utility'
import { FaChevronRight } from "react-icons/fa";
import { updateStateOfCurlSlider } from '../modals/redux/modalsActions'
import { connect } from 'react-redux'

const HTTPSnippet = require('httpsnippet')

const mapStateToProps = (state) => ({
  modal: state.modals || {},
  isActive: state.isActive,
});

const mapDispatchToProps = (dispatch) => ({
  ON_CURL_SLIDER_OPEN: (payload) => dispatch(updateStateOfCurlSlider(payload)),
});
class CodeTemplate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      theme: '',
      curlSlider: false
    }
    this.selectedLanguage = 'shell'
    this.iconRef = React.createRef()
    this.OutlineArrowRef = React.createRef()
    this.pubCodesRef = React.createRef()
    this.iconNoneRef = React.createRef()
    this.closeIconRef = React.createRef()
    this.codeTemplateRef = React.createRef()
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  handleButtonClick() {
    const { curlSlider } = this.state;
    this.setState({ curlSlider: !curlSlider });
    this.props.ON_CURL_SLIDER_OPEN(!curlSlider);
  }
  makeCodeSnippet() {
    const harObject = this.props.harObject
    let { method, url, httpVersion, cookies, headers, postData } = harObject
    const snippet = new HTTPSnippet({
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData
    })
    return snippet
  }

  makeCodeTemplate(selectedLanguage) {
    const harObject = this.props.harObject
    if (!harObject || !harObject.method) return
    this.selectedLanguage = selectedLanguage
    this.selectedLanguageName = languages[selectedLanguage].name
    let codeSnippet = ''
    try {
      const snippet = this.makeCodeSnippet()
      if (selectedLanguage === 'axiosNode') {
        codeSnippet = snippet.convert('node', 'axios');
      } else {
        codeSnippet = snippet.convert(selectedLanguage);
      }
      codeSnippet = decodeURI(codeSnippet)
    } catch (error) {
      console.error(error)
    }
    this.setState({ codeSnippet, copied: false })
  }

  componentDidMount() {
    if (this.props.harObject) {
      this.makeCodeTemplate(this.selectedLanguage)
    }
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.harObject !== prevProps.harObject) {
      this.makeCodeTemplate(this.selectedLanguage)
    }
    if (prevState.codeSnippet !== this.state.codeSnippet) {
      this.adjustEditorHeight();
    }
  }

  handleCloseClick = () => {
    this.props.updateCurlSlider(false)
  }

  getClassForLanguages = (key) => {
    const commonClass = 'mr-2 d-flex d-md-flex flex-column justify-content-center align-items-center';
    let classToReturn = key === this.selectedLanguage ? 'active ' + commonClass : commonClass;
    return this.props.theme !== 'light' ? classToReturn + ' ' : classToReturn;
  }

  adjustEditorHeight = () => {
    if (this.codeTemplateRef.current) {
      const editor = this.codeTemplateRef.current.editor;
      const newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth();
      this.setState({ editorHeight: `${newHeight}px` });
    }
  }

  render() {
    return (
      <>
      <div className='d-flex'>
        { isOnPublishedPage() && (
         <button
          onClick={this.handleButtonClick}
          className={`pubCode-icon btn mt-4${this.props.curlSlider ? ' active' : ''}`}
        >
          <FaChevronRight />
        </button>)}
        <div
       className={this.props.match.params.endpointId ? 'show-curl-endpoint pubCodeWrapper'  : this.props.curlSlider ? 'pubCodeWrapper-hide pubCodeWrapper' : 'pubCodeWrapper'}
      style={{
        backgroundColor: hexToRgb(this.state?.theme, '0.04')
      }}
        >
          <div className='inner-editor'>
            <Col id='code-window-sidebar' xs={12} className=''>
              <div className='code-heading mb-3 d-flex align-items-center'>
                <span className={this.props.theme === 'light' ? 'col-black' : 'col-black'}>Sample code</span>
                {this.props.showClosebtn && <div className='d-flex justify-content-end flex-grow-1'>
                  <IconButton>
                    <RiCloseLine color='black' className='cur-pointer' onClick={this.handleCloseClick} />
                  </IconButton>
                </div>}
              </div>
              <div className='select-code-wrapper d-flex align-items-center mb-3 img'>
                {primaryLanguages.map((key) => (
                  <button
                    key={key}
                    className={`${(this.props.match.params.endpointId) ? "btn btn-outline-dark" : ""}  ${this.getClassForLanguages(key)}`}
                    onClick={() => {
                      this.makeCodeTemplate(key)
                    }}
                  >
                    <img src={languages[key].imagePath} alt={languages[key].name} width={15} />
                    {languages[key].name}
                  </button>
                ))}
                <Dropdown >
                  <Dropdown.Toggle className={secondaryLanguages.includes(this.selectedLanguage) ? 'active dropdownMore mr-0' : 'dropdownMore mr-0'}>
                    {primaryLanguages.includes(this.selectedLanguage) ? (
                      <span><BsThreeDotsVertical />
                      </span>
                    ) : (
                      <span>{languages[this.selectedLanguage].name}</span>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {secondaryLanguages.map((key) => (
                      <Dropdown.Item
                        key={key}
                        className={key === this.selectedLanguage ? 'active mb-2 mt-2' : 'mb-2 mt-2'}
                        onClick={() => {
                          this.makeCodeTemplate(key)
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
            <Col className='editor-body-wrapper' xs={12}>
              <div className='ace-editor-wrapper'>
                <div id='code-window-body' className={!isOnPublishedPage() ? 'copy-button-light' : 'copy-button-dark'}>
                  <CopyToClipboard
                    text={this.state.codeSnippet ? this.state.codeSnippet : this.codeSnippet}
                    onCopy={() => this.setState({ copied: true }, () => setTimeout(() => this.setState({ copied: false }), 1000))}
                    className='copy-to-clipboard mt-1'
                  >
                    <button >{this.state.copied ? <IconButton> <RiCheckboxMultipleLine color={this.props.theme === 'light' ? 'black' : "white"} /> </IconButton> : <IconButton><RiCheckboxMultipleBlankLine className='cur-pointer' color={this.props.theme === 'light' ? 'black' : "white"} /></IconButton>}</button>
                  </CopyToClipboard>
                </div>
                <AceEditor
                  height={this.state.editorHeight}
                  ref={this.codeTemplateRef}
                  mode={languages[this.selectedLanguage].mode}
                  theme={this.props.theme === 'light' ? 'kuroir' : "tomorrow_night"}
                  highlightActiveLine={false}
                  focus={false}
                  value={this.state.codeSnippet ? this.state.codeSnippet : this.codeSnippet}
                  readOnly
                  editorProps={{
                    $blockScrolling: false
                  }}
                  showGutter={false}
                  onLoad={(editor) => {
                    editor.getSession().setUseWrapMode(true)
                    editor.setShowPrintMargin(false)
                  }}
                />
                <div id='code-window-body' className={!isOnPublishedPage() ? 'empty-div-light' : 'empty-div-dark'}></div>
              </div>
            </Col>
          </div>
        </div>
        </div>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CodeTemplate);
