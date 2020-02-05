import React, { Component } from "react";
import endpointService from "../services/endpointService";
import http from "../services/httpService";
import JSONPretty from "react-json-pretty";

class DisplayEndpoint extends Component {
  uri = React.createRef();
  body = React.createRef();

  state = {
    method: "GET",
    response: {},
    body: ""
  };

  handleSubmit = async e => {
    e.preventDefault();
    const api = "http://localhost:2000" + this.uri.current.value;
    this.state.body = this.body.current.value;
    try {
      if (this.state.body != "") this.state.body = JSON.parse(this.state.body);
    } catch (error) {
      console.log(error);
    }

    const { data: response } = await endpointService.apiTest(
      api,
      this.state.method,
      this.state.body
    );

    console.log("jjj", response);
    this.setState({ response });
  };

  convertToString(response) {
    try {
      return JSON.stringify(response);
    } catch (ex) {
      return response;
    }
  }
  setMethod(method) {
    const response = {};
    this.setState({ response, method });
  }
  render() {
    if (this.state.response) {
      this.state.response = this.convertToString(this.state.response);
    }
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon3">
                <div class="dropdown">
                  <button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {this.state.method}
                  </button>
                  <div
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <a
                      class="dropdown-item"
                      onClick={() => this.setMethod("GET")}
                    >
                      GET
                    </a>
                    <a
                      class="dropdown-item"
                      onClick={() => this.setMethod("POST")}
                    >
                      POST
                    </a>
                    <a
                      class="dropdown-item"
                      onClick={() => this.setMethod("DELET")}
                    >
                      DELETE
                    </a>
                    <a
                      class="dropdown-item"
                      onClick={() => this.setMethod("PUT")}
                    >
                      PUT
                    </a>
                  </div>
                </div>
              </span>
              <span class="input-group-text" id="basic-addon3">
                http://localhost:2000
              </span>
            </div>
            <input
              ref={this.uri}
              type="text"
              name="uri"
              class="form-control"
              id="basic-url"
              aria-describedby="basic-addon3"
            />
            <button
              class="btn btn-outline-secondary"
              type="submit"
              id="button-addon2"
            >
              Send
            </button>
          </div>

          <div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="none"
                value="none"
              />
              <label class="form-check-label" for="none">
                none
              </label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="raw"
                value="raw"
              />
              <label class="form-check-label" for="raw">
                raw
              </label>
            </div>
          </div>

          <textarea
            class="form-control"
            ref={this.body}
            name="body"
            id="body"
            rows="8"
          ></textarea>
        </form>

        <JSONPretty
          themeClassName="custom-json-pretty"
          data={this.state.response}
        />
      </div>
    );
  }
}

export default DisplayEndpoint;
