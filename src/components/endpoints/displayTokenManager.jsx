import React, { Component } from "react";
import { Modal, ListGroup, Container, Row, Col } from "react-bootstrap";
import endpointApiService from "./endpointApiService";

class AccessTokenManager extends Component {
  state = {
    tokenIndex: 0,
  };

  selectTokenIndex(tokenIndex) {
    this.setState({ tokenIndex });
  }

  // deleteToken(toeknIndex) {
  //   endpointApiService.deleteToken()
  // }

  authResponse = {
    tokenName: "Token Name",
    access_token: "Access Token",
    token_type: "Token Type",
    expires_in: "expires_in",
    scope: "scope",
  };

  setSelectedToken() {
    const accessToken = this.props.authResponses[this.state.tokenIndex]
      .access_token;
    this.props.set_access_token(accessToken);
  }

  render() {
    return (
      <div>
        <Modal
          {...this.props}
          id="modal-code-window"
          size="lg"
          animation={false}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header
            className="custom-collection-modal-container"
            closeButton
          >
            <Modal.Title id="contained-modal-title-vcenter">
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container className="d-flex flex-column">
              <Row>
                <Col id="code-window-sidebar" sm={3}>
                  <ListGroup>
                    <ListGroup.Item>All Tokens</ListGroup.Item>
                    {this.props.authResponses.map((response, index) => (
                      <ListGroup.Item
                        onClick={() => {
                          this.selectTokenIndex(index);
                        }}
                      >
                        {response.tokenName}
                        {/* <button onClick={() => this.deleteToken(index)}>
                          Delete{" "}
                        </button> */}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <v1></v1>
                </Col>
                <Col sm={9}>
                  <div>
                    <div>Token Details</div>
                    <button
                      type="button"
                      onClick={() => this.setSelectedToken()}
                    >
                      Use Token
                    </button>
                    <div>
                      <div>
                        {Object.keys(this.authResponse).map((property) => (
                          <div>
                            {this.authResponse[property]}
                            {
                              this.props.authResponses[this.state.tokenIndex][
                                property
                              ]
                            }
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
    );
  }
}

export default AccessTokenManager;
