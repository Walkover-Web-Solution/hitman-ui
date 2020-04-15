import React, { Component } from "react";
import { isDashboardRoute } from "../common/utility";
import { Link } from "react-router-dom";
import { updateEndpoint } from "./redux/endpointsActions";
import { connect } from "react-redux";

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateEndpoint: (editedEndpoint) =>
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

    this.props.updateEndpoint({ id: endpoint.id, description: value });

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
      <div>
        <div className="endpoint-name-container">
          {this.props.endpoint.description !== undefined &&
          isDashboardRoute(this.props) ? (
            <button className="endpoint-description">
              <i
                className={
                  this.state.showAddDescriptionFlag === true
                    ? "fas fa-caret-down "
                    : "fas fa-caret-right"
                }
                onClick={() => this.showDescription()}
              ></i>
            </button>
          ) : null}
          <input
            type="text"
            className={
              isDashboardRoute(this.props)
                ? "endpoint-name-input"
                : "public-endpoint-name-input"
            }
            aria-label="Username"
            aria-describedby="addon-wrapping"
            name="name"
            placeholder="Endpoint Name"
            value={this.props.data.name}
            onChange={this.handleChange}
            disabled={isDashboardRoute(this.props) ? null : true}
          />
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
            <div>
              <label style={{ padding: "5px 5px 0px 35px" }}>
                {this.props.endpoint.description}
              </label>
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

        {this.state.showDescriptionFormFlag && isDashboardRoute(this.props) ? (
          <form onSubmit={this.handleDescriptionSave.bind(this)}>
            <div
              className="form-group"
              style={{ padding: "5px 10px 5px 10px" }}
            >
              <textarea
                className="form-control"
                rows="3"
                name="description"
                placeholder="Make things easier for your teammates with a complete endpoint description"
                value={this.props.endpoint.description}
                onChange={this.handleChangeDescription}
              ></textarea>
              <div style={{ float: "right", margin: "5px" }}>
                <button
                  className="btn btn-primary"
                  type="cancel"
                  onClick={() => this.handleDescriptionCancel()}
                  style={{
                    margin: "0px 5px 0px 0px",
                    color: "tomato",
                    background: "none",
                    border: "none",
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{
                    margin: "0px 0px 0px 5px",
                    background: "tomato",
                    border: "none",
                  }}
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
