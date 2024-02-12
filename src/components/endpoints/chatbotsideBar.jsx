import React, { Component } from 'react'
import { connect } from 'react-redux'
import './endpoints.scss'
import { inviteMember } from '../../services/chatbotService'
import { getCurrentUser } from '../auth/authServiceV2'

const mapStateToProps = (state) => {
  return {
    // Include only the Redux state props you need
  }
}

class chatbotsideBar extends Component {
  state = {
    inputValue: ''
  }

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value })
  }

  handleOnkeyDown = (e) => {
    if (e.keyCode === 13) {
      this.handleSubmit()
    }
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
      top: '40px',
      right: '0px',
      height: '95vh',
      width: '24%',
      float: 'right'
    }

    const inputContainerStyle = {
      display: 'flex',
      position: 'absolute',
      bottom: '0',
      width: '100%',
      padding: '10px',
      borderTop: '1px ',
      backgroundColor: 'white'
    }

    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '0.5px solid #ddd'
    }

    const closeButtonStyle = {
      background: 'none',
      border: 'none',
      fontSize: '1.5em',
      cursor: 'pointer'
    }

    return (
      <div>
        <div style={saveAsSidebarStyle} className='save-as-sidebar-container'>
          <div style={headerStyle}>
            <h3>Chat with AI</h3>
            <button
              style={closeButtonStyle}
              onClick={() => {
                this.props.onHide()
              }}
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
              onKeyDown={this.handleOnkeyDown}
              className='form-control'
              placeholder='Enter your chat here'
            />
            <button onClick={this.handleSubmit} className='send-icon'>
              <i className='fa fa-paper-plane' aria-hidden='true' />
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(chatbotsideBar)
