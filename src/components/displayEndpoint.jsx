import React, { Component } from "react";
import endpointService from "../services/endpointService";
import http from "../services/httpService";
import JSONPretty from "react-json-pretty";
import { Dropdown } from "react-bootstrap";

class DisplayEndpoint extends Component {
  uri = React.createRef();
  body = React.createRef();

  state = {
    data: {
      name: "",
      method: "GET",
      body: "",
      uri: ""
    },
    response: {}
  };

  handleChange = e => {
    let data = { ...this.state.data };
    console.log("data1", data);
    // console.log("hhh", api);
    data.uri = e.currentTarget.value;
    console.log("data2", data);
    // data.method = e.currentTarget.value;
    this.setState({ data });
  };

  handleSubmit = async () => {
    const api = "http://localhost:2000" + this.uri.current.value;
    // this.state.data.api = api;
    this.state.data.body = this.body.current.value;
    try {
      if (this.state.data.body != "")
        this.state.data.body = JSON.parse(this.state.data.body);
    } catch (error) {
      console.log(error);
    }
    const { data: response } = await endpointService.apiTest(
      api,
      this.state.data.method,
      this.state.data.body
    );
    this.setState({ response });
  };

  handleSave = async e => {
    const uri = this.uri.current.value;
    const endpoint = {
      uri: uri,
      name: this.props.location.endpoint.name,
      requestType: this.state.data.method
    };

    const { data: response } = await endpointService.updateEndpoint(
      this.props.location.endpoint.id,
      endpoint
    );
  };

  setMethod(method) {
    const response = {};
    let data = { ...this.state.data };
    data.method = method;
    console.log("setstate", data);
    this.setState({ response, data });
  }
  render() {
    console.log("endpoint props", this.props);
    if (
      this.props.location.endpoint &&
      this.props.location.title != "Add New Endpoint"
    ) {
      this.state.data.method = this.props.location.endpoint.requestType;
      this.state.data.uri = this.props.location.endpoint.uri;
      this.state.data.name = this.props.location.endpoint.name;

      // this.props.history.push({ endpoint: null });
    }
    console.log("display props", this.props);

    return (
      <div>
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon3">
              <div class="dropdown">
                <div className="Environment Dropdown">
                  <Dropdown className="float-light">
                    <Dropdown.Toggle variant="default" id="dropdown-basic">
                      {this.state.data.method}
                    </Dropdown.Toggle>

                    <Dropdown.Menu alignRight>
                      <Dropdown.Item onClick={() => this.setMethod("GET")}>
                        GET
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setMethod("POST")}>
                        POST
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => this.setMethod("PUT")}>
                        PUT
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => this.setMethod("DELETE")}>
                        DELETE
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </span>
            <span
              class="form-control form-control-lg"
              class="input-group-text"
              id="basic-addon3"
            >
              BASE_URL
            </span>
          </div>
          <input
            ref={this.uri}
            type="text"
            value={this.state.data.uri}
            name="uri"
            class="form-control form-control-lg"
            id="basic-url"
            aria-describedby="basic-addon3"
            onChange={this.handleChange}
          />
          <button
            class="btn btn-outline-secondary"
            type="submit"
            id="button-addon2"
            onClick={() => this.handleSubmit()}
          >
            Send
          </button>
          <button
            class="btn btn-outline-secondary"
            type="button"
            id="button-addon2"
            onClick={() => this.handleSave()}
          >
            Save
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

        <JSONPretty
          themeClassName="custom-json-pretty"
          data={this.state.response}
        />
      </div>
    );
  }
}

export default DisplayEndpoint;
