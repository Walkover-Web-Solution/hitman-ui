import React, { Component } from 'react'
import { connect } from 'react-redux'
import './endpoints.scss'
import { inviteMember } from '../../services/chatbotService'
import { getCurrentUser } from '../auth/authServiceV2'


const mapStateToProps = state => {
  return {
    // Include only the Redux state props you need
  }
}

class chatbotsideBar extends Component {
  state = {
    inputValue: ''
  }

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  }

  handleSubmit = () => {
    const query = this.state.inputValue
    const name = getCurrentUser()?.name
    inviteMember(name, query)
  }

  render() {
    
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: 'white',
      zIndex: '1050 ',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '35vw',
      boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)',
      overflow: 'hidden'
    }
    const darkBackgroundStyle = {
      position: 'fixed',
      background: 'rgba(0, 0, 0, 0.4)',
      opacity: 1,
      zIndex: '1040',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '100vw'
    }
    const inputContainerStyle = {
      display: 'flex',
      position: 'absolute',
      bottom: '0',
      width: '100%',
      padding: '10px',
      borderTop: '1px ',
      backgroundColor: 'white',
    }

    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '10px', 
      borderBottom: '0.5px solid #ddd', 
    };

    const closeButtonStyle = {
      background: 'none',
      border: 'none',
      fontSize: '1.5em', 
      cursor: 'pointer',
      
    };

    return (
      <div>
        <div
          onClick={() => { this.setState({ showCollectionForm1: false }) }}
          style={darkBackgroundStyle}
        >
        </div>
        <div style={saveAsSidebarStyle} className='save-as-sidebar-container'>
        <div style={headerStyle}>
            <h3>Chat with AI</h3>
            <button
              style={closeButtonStyle}
              onClick={() => { this.props.onHide() }}
              aria-label='Close' // Accessibility label for screen readers
            >
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div style={inputContainerStyle}>
            <input
              type='text'
              value={this.state.inputValue}
              onChange={this.handleInputChange}
              className='form-control'
              placeholder='Enter your chat here'
            />
            <button onClick={this.handleSubmit} className='send-icon'>
              <i className='fa fa-paper-plane' aria-hidden='true'></i>
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(chatbotsideBar);
