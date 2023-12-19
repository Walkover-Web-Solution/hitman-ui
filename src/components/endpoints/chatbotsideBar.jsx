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
    inputValue: '',
    messages: [],
  }

  handleInputChange = (e) => {
    console.log(e.target.value, "input value");
    this.setState({ inputValue: e.target.value });
  }

  handleOnkeyDown = (e) => {
    if (e.keyCode === 13) {
      this.handleSubmit();
    }
  }

  // handleSubmit = async () => {
  //   const query = this.state.inputValue
  //   const name = getCurrentUser()?.name
  //   const newMessage = { text: query, sender: name };
  //   const aiMessage = "getBack to you soon"
  //   this.setState((prevState) => ({
  //     messages: [...prevState.messages, newMessage, aiMessage],
  //     inputValue: '' // Clear the input after submitting
  //   }), () => {
  //     console.log(this.state.messages, "messages in array");
  //   });
  //   const reply = await inviteMember(name, query)
  //   console.log(reply, "replyyyyyyy");
  // }
  handleSubmit = async () => {
    const query = this.state.inputValue;
    const name = getCurrentUser()?.name;
    const userMessage = { text: query, sender: name };
    const aiMessage = { text: "getBack to you soon", sender: "AI" }; // Modify the sender as needed
  
    this.setState((prevState) => ({
      messages: [...prevState.messages, userMessage, aiMessage],
      inputValue: '' // Clear the input after submitting
    }), () => {
      console.log(this.state.messages, "messages in array");
    });
  
    const reply = await inviteMember(name, query);
    console.log(reply, "replyyyyyyy");
  }
  
  render() {
    
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: 'white',
      top: '40px',
      right: '0px',
      height: '95vh',
      width: '22%',
      float: 'right'
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
          <div className="messages-container mb-2">
              {this.state.messages.map((message, index) => (
                <div key={index} className={message.sender === getCurrentUser()?.name ? 'user-message' : 'ai-message'}>
                  {message.text}
                </div>
              ))}
            </div>
          <div style={inputContainerStyle}>
            <input
              type='text'
              value={this.state.inputValue}
              onChange={this.handleInputChange}
              onKeyDown = {this.handleOnkeyDown}
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
