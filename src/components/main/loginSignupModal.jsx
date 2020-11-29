import React from 'react'
import { Modal } from 'react-bootstrap'

import loginIcon from '../../assets/icons/loginIcon.svg'

function LoginSignupModal (props) {
  const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'
  return (
    <Modal
      {...props}
      id='modal-open-api'
      size='md'
      animation={false}
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >

      <Modal.Header closeButton />
      <Modal.Body>
        <div>
          {
            props.title === 'Save Endpoint'
              ? (
                <div>
                  <img src={loginIcon} />
                  <div>Seems you have not Registered with us.</div>
                </div>
                )
              : (
                <div className='loginModalWrapper'>
                  <h5> Seems you are not logged in.</h5>
                  <p>  Kindly login or signup to save collection in your account</p>
                  <div className='text-center mt-3'>
                    <button className='btn btn-primary btn-lg'>Login/Signup</button>
                  </div>
                </div>
                )
          }
          <div
            id='sokt-sso'
            data-redirect-uri={redirectionUrl}
            data-source='sokt-app'
            data-token-key='sokt-auth-token'
            data-view='button'
          />
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default LoginSignupModal
