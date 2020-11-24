import React, { Component } from 'react'
import { Modal, ListGroup, Container, Row, Col } from 'react-bootstrap'
import './endpoints.scss'

class AccessTokenManager extends Component {
  constructor (props) {
    super(props)
    this.state = {
      authResponses: [],
      tokenIndex: 0
    }

    this.authResponse = {
      tokenName: 'Token Name',
      access_token: 'Access Token',
      token_type: 'Token Type',
      expires_in: 'expires_in',
      scope: 'scope'
    }
  }

  componentDidMount () {
    this.setState({ authResponses: this.props.authResponses })
  }

  selectTokenIndex (tokenIndex) {
    this.selectEditToken('cancel')
    this.setState({ tokenIndex })
  }

  setSelectedToken () {
    const accessToken = this.props.authResponses[this.state.tokenIndex]
      .access_token
    this.props.set_access_token(accessToken)
  }

  selectEditToken (value) {
    if (value === 'edit') this.setState({ editTokenName: true })
    else this.setState({ editTokenName: false })
  }

  deleteToken (index) {
    const authResponses = this.state.authResponses
    const updatedAuthResponses = []
    for (let i = 0; i < authResponses.length; i++) {
      if (i === index) {
        continue
      } else {
        updatedAuthResponses.push(authResponses[i])
      }
    }
    if (this.props.accessToken === authResponses[index].access_token) {
      if (updatedAuthResponses.length === 0) this.props.set_access_token('')
      else this.props.set_access_token(updatedAuthResponses[0].access_token)
    }
    this.setState({ tokenIndex: 0, authResponses: updatedAuthResponses })
    this.props.set_auth_responses(updatedAuthResponses)
  }

  updateTokenName (e) {
    const authResponses = this.state.authResponses
    authResponses[this.state.tokenIndex].tokenName = e.currentTarget.value
    this.setState({ authResponses })
    this.props.set_auth_responses(authResponses)
  }

  render () {
    return (
      <div>
        <Modal
          {...this.props}
          id='modal-display-token'
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          <Modal.Header
            className='custom-collection-modal-container'
            closeButton
          >
            <Modal.Title id='contained-modal-title-vcenter'>
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container className='d-flex flex-column'>
              <Row>
                <Col id='code-window-sidebar' sm={3}>
                  <ListGroup>
                    <ListGroup.Item>All Tokens</ListGroup.Item>
                    {this.state.authResponses.map((response, index) => (
                      <div key={index}>
                        <ListGroup.Item className='tokens-list-item'>
                          <label
                            onClick={() => {
                              this.selectTokenIndex(index)
                            }}
                          >
                            {response.tokenName}
                          </label>
                          <button
                            className='btn delete-button'
                            onClick={() => this.deleteToken(index)}
                          >
                            <i class='fas fa-trash' />
                          </button>
                        </ListGroup.Item>
                      </div>
                    ))}
                  </ListGroup>
                  <v1 />
                </Col>
                <Col sm={9}>
                  <div>
                    <div>
                      <div className='token-detail-div'>
                        <label className='custom-token-detais'>
                          Token Details
                        </label>

                        <button
                          className='oauth2-token-details-list-item-button'
                          type='button'
                          onClick={() => this.setSelectedToken()}
                        >
                          Use Token
                        </button>
                      </div>
                    </div>

                    <br />
                    <div>
                      <div className='oauth2-token-details-list'>
                        {Object.keys(this.authResponse).map((property) => (
                          <div
                            key={property}
                            className='oauth2-token-details-list-item'
                          >
                            <label className='oauth2-token-details-list-item-label'>
                              {this.authResponse[property]}
                            </label>
                            <div className='oauth2-token-details-list-item-value'>
                              {!this.state.editTokenName ? (
                                this.state.authResponses[
                                  this.state.tokenIndex
                                ] ? (
                                      this.state.authResponses[
                                        this.state.tokenIndex
                                      ][property]
                                    ) : null
                              ) : property !== 'tokenName' ? (
                                this.state.authResponses[
                                  this.state.tokenIndex
                                ] ? (
                                      this.state.authResponses[
                                        this.state.tokenIndex
                                      ][property]
                                    ) : null
                              ) : this.state.editTokenName !== true ? (
                                this.state.authResponses[
                                  this.state.tokenIndex
                                ] ? (
                                      this.state.authResponses[
                                        this.state.tokenIndex
                                      ][property]
                                    ) : null
                              ) : (
                                <div>
                                  <input
                                    name='tokenName'
                                    value={
                                      this.state.authResponses[
                                        this.state.tokenIndex
                                      ].tokenName
                                    }
                                    onChange={this.updateTokenName.bind(this)}
                                  />
                                  <button
                                    type='button'
                                    onClick={() => this.selectEditToken('')}
                                  >
                                    Save
                                  </button>
                                </div>
                              )}
                              {this.authResponse[property] === 'Token Name' ? (
                                this.state.editTokenName ? (
                                  this.state.editTokenName === true ? null : (
                                    <button
                                      className='display-token-edit-button'
                                      onClick={() =>
                                        this.selectEditToken('edit')}
                                    >
                                      <i className='fas fa-pen' />
                                    </button>
                                  )
                                ) : (
                                  <button
                                    className='display-token-edit-button'
                                    onClick={() => this.selectEditToken('edit')}
                                  >
                                    <i className='fas fa-pen' />
                                  </button>
                                )
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default AccessTokenManager
