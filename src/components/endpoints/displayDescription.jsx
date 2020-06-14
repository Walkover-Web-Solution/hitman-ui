import React, { Component } from "react";
import { isDashboardRoute } from "../common/utility";
import { Link } from "react-router-dom";
import { updateEndpoint } from "./redux/endpointsActions";
import { connect } from "react-redux";

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_endpoint: (editedEndpoint) =>
      dispatch(updateEndpoint(editedEndpoint)),
  };
};

class DisplayDescription extends Component {
  state = {
    showDescriptionFormFlag: false,
    showAddDescriptionFlag: isDashboardRoute(this.props) ? false : true,
  };

  handleChange = (e) => {
    let data = { ...this.props.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.props.props_from_parent("data", data);
  };

  handleDescription() {
    const showDescriptionFormFlag = true;
    let showAddDescriptionFlag = true;
    this.setState({ showDescriptionFormFlag, showAddDescriptionFlag });
  }

  handleDescriptionCancel() {
    let endpoint = { ...this.props.endpoint };
    endpoint.description = this.props.old_description;
    const showDescriptionFormFlag = false;
    this.setState({
      showDescriptionFormFlag,
      showAddDescriptionFlag: true,
    });
    this.props.props_from_parent("endpoint", endpoint);
  }

  handleDescriptionSave(e) {
    e.preventDefault();
    const value = e.target.description.value;
    let endpoint = { ...this.props.endpoint };

    this.props.update_endpoint({ id: endpoint.id, description: value });

    endpoint.description = value;
    this.setState({
      showDescriptionFormFlag: false,
      showAddDescriptionFlag: true,
    });
    this.props.props_from_parent("endpoint", endpoint);
    this.props.props_from_parent("oldDescription", value);
  }

  handleChangeDescription = (e) => {
    let endpoint = { ...this.props.endpoint };
    endpoint[e.currentTarget.name] = e.currentTarget.value;
    this.props.props_from_parent("endpoint", endpoint);
  };

  showDescription() {
    let showAddDescriptionFlag = !this.state.showAddDescriptionFlag;
    this.setState({ showAddDescriptionFlag, showDescriptionFormFlag: false });
  }

  render() {
    return (
      <div class="endpoint-header">
        <div className={
          isDashboardRoute(this.props)
            ? "panel-endpoint-name-container"
            : "endpoint-name-container"
          }>
          {this.props.endpoint.description !== undefined &&
          isDashboardRoute(this.props) ? (
            <React.Fragment>
              {/* <button className="endpoint-description">
                <i
                  className={
                    this.state.showAddDescriptionFlag === true
                      ? "fas fa-caret-down "
                      : "fas fa-caret-right"
                  }
                  onClick={() => this.showDescription()}
                ></i>
              </button> */}
              {/* <input
                type="text"
                className="endpoint-name-input"
                aria-label="Username"
                aria-describedby="addon-wrapping"
                name="name"
                placeholder="Endpoint Name"
                value={this.props.data.name}
                onChange={this.handleChange}
              /> */}
              </React.Fragment>
          )
          : null
          }

          {isDashboardRoute(this.props) &&
          <React.Fragment>
            <label class="hm-panel-label">Endpoint title</label>
            <input
              type="text"
              className={"form-control"}
              aria-label="Username"
              aria-describedby="addon-wrapping"
              name="name"
              placeholder="Endpoint Name"
              value={this.props.data.name}
              onChange={this.handleChange}
              disabled={isDashboardRoute(this.props) ? null : true} />
            </React.Fragment>
          }
          {!isDashboardRoute(this.props) &&
            <h1 class="endpoint-title">
              {this.props.data.name}
            </h1>
          }
        </div>

        {this.state.showAddDescriptionFlag &&
        !this.state.showDescriptionFormFlag ? (
          this.props.endpoint.description === "" &&
          isDashboardRoute(this.props) ? (
            <Link
              style={{
                padding: "0px 0px 0px 35px",
                fontSize: "15px",
                color: "tomato",
              }}
              onClick={() => this.handleDescription()}
            >
              Add a Description
            </Link>
          ) : (
            <div class="endpoint-description">
              <div className="endpoint-description-text">
                {this.props.endpoint.description}
              </div>
              {isDashboardRoute(this.props) ? (
                <button
                  className="btn btn-default"
                  onClick={() => this.handleDescription()}
                >
                  <i className="fas fa-pen"></i>
                </button>
              ) : null}
            </div>
          )
        ) : null}

        {isDashboardRoute(this.props) ? (
          <form onSubmit={this.handleDescriptionSave.bind(this)}>
          <label class="hm-panel-label">Endpoint Description</label>
            <div
              className="endpoint-description-wrap"
            >
              <textarea
                className="form-control"
                rows="3"
                name="description"
                placeholder="Make things easier for your teammates with a complete endpoint description"
                value={this.props.endpoint.description}
                onChange={this.handleChangeDescription}
              ></textarea>
              <div className="endpoint-cta">
                {/* <button
                  className="btn btn-link"
                  type="cancel"
                  onClick={() => this.handleDescriptionCancel()}
                >
                  Cancel
                </button> */}
                <button
                  className="btn btn-primary"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(DisplayDescription);
