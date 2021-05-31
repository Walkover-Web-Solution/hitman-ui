import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import notLoggedIn from '../../assets/icons/notLoggedIn.svg'
import './loginSignupModal.scss'

function LoginSignupModal (props) {
  const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'

  useEffect(() => {
    const ssoDiv = document.getElementById('sokt-sso-modal')

    if (ssoDiv) {
      ssoDiv.appendChild(window.ssoButton(ssoDiv))
    }
  }, [])

  return (
    <Modal
      {...props}
      id='modal-open-api'
      size='md'
      animation={false}
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >

      <Modal.Header className='not-loggedin' closeButton />
      <Modal.Body>
        <div className='text-center'>
          {
            props.title === 'Save Endpoint'
              ? (
                <div>
                  <img src={notLoggedIn} alt='' />
                  <h5 className='heading-2 mt-3 mb-3'> Seems you are not logged in.</h5>
                </div>
                )
              : (
                <div className='loginModalWrapper'>
                  <img src={notLoggedIn} alt='' />
                  <h5> Seems you are not logged in.</h5>
                  <p>  Kindly login or signup to save collection in your account</p>
                </div>
                )
          }
          <div
            id='sokt-sso-modal'
            data-redirect-uri={redirectionUrl}
            data-source='sokt-app'
            data-token-key='sokt-auth-token'
            data-view='button'
            data-app-logo-url='https://hitman.app/wp-content/uploads/2020/12/123.png'
            signup_uri={redirectionUrl + '?signup=true'}
          />
        </div>
        <div className='list'>
          <div className='heading'>Logged in user can:</div>
          <ol>
            <li>Host Public API documentation</li>
            <li>Create/Manage Environment</li>
            <li>Create/Share internal API documentation</li>
            <li>Get Access to our Marketplace</li>
          </ol>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default LoginSignupModal
