import React, { Component } from "react";
import { Modal, ListGroup, Container, Row, Col } from "react-bootstrap";

class AccessTokenManager extends Component {
  state = {
    authResponses: [],
    tokenIndex: 0,
  };

  authResponse = {
    tokenName: "Token Name",
    access_token: "Access Token",
    token_type: "Token Type",
    expires_in: "expires_in",
    scope: "scope",
  };

  componentDidMount() {
    this.setState({ authResponses: this.props.authResponses });
  }

  selectTokenIndex(tokenIndex) {
    this.selectEditToken("cancel");
    this.setState({ tokenIndex });
  }

  setSelectedToken() {
    const accessToken = this.props.authResponses[this.state.tokenIndex]
      .access_token;
    this.props.set_access_token(accessToken);
  }

  selectEditToken(value) {
    if (value === "edit") this.setState({ editTokenName: true });
    else this.setState({ editTokenName: false });
  }

  deleteToken(index) {
    let authResponses = this.state.authResponses;
    let updatedAuthResponses = [];
    for (let i = 0; i < authResponses.length; i++) {
      if (i === index) {
        continue;
      } else {
        updatedAuthResponses.push(authResponses[i]);
      }
    }
    if (this.props.accessToken === authResponses[index].access_token) {
      if (updatedAuthResponses.length === 0) this.props.set_access_token("");
      else this.props.set_access_token(updatedAuthResponses[0].access_token);
    }
    this.setState({ tokenIndex: 0, authResponses: updatedAuthResponses });
    this.props.set_auth_responses(updatedAuthResponses);
  }

  updateTokenName(e) {
    let authResponses = this.state.authResponses;
    authResponses[this.state.tokenIndex].tokenName = e.currentTarget.value;
    this.setState({ authResponses });
    this.props.set_auth_responses(authResponses);
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
                    {this.state.authResponses.map((response, index) => (
                      <div>
                        <ListGroup.Item
                          onClick={() => {
                            this.selectTokenIndex(index);
                          }}
                        >
                          {response.tokenName}
                        </ListGroup.Item>
                        <button onClick={() => this.deleteToken(index)}>
                          Delete
                        </button>
                      </div>
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
                            {!this.state.editTokenName ? (
                              this.state.authResponses[
                                this.state.tokenIndex
                              ] ? (
                                this.state.authResponses[this.state.tokenIndex][
                                  property
                                ]
                              ) : null
                            ) : property !== "tokenName" ? (
                              this.state.authResponses[
                                this.state.tokenIndex
                              ] ? (
                                this.state.authResponses[this.state.tokenIndex][
                                  property
                                ]
                              ) : null
                            ) : this.state.editTokenName !== true ? (
                              this.state.authResponses[
                                this.state.tokenIndex
                              ] ? (
                                this.state.authResponses[this.state.tokenIndex][
                                  property
                                ]
                              ) : null
                            ) : (
                              <div>
                                <input
                                  name="tokenName"
                                  value={
                                    this.state.authResponses[
                                      this.state.tokenIndex
                                    ]["tokenName"]
                                  }
                                  onChange={this.updateTokenName.bind(this)}
                                ></input>
                                <button
                                  type="button"
                                  onClick={() => this.selectEditToken("")}
                                >
                                  Save
                                </button>
                              </div>
                            )}
                            {this.authResponse[property] === "Token Name" ? (
                              this.state.editTokenName ? (
                                this.state.editTokenName === true ? null : (
                                  <button
                                    onClick={() => this.selectEditToken("edit")}
                                  >
                                    Edit
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => this.selectEditToken("edit")}
                                >
                                  Edit
                                </button>
                              )
                            ) : null}
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
