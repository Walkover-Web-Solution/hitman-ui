import React, { Component } from "react";
import auth from "../auth/authService";
import { Link } from "react-router-dom";

class UserInfo extends Component {
  state = { user: { name: "", email: "" } };

  componentDidMount() {
    if (auth.getCurrentUser()) {
      let user = {};
      const { user: currentUser } = auth.getCurrentUser();
      user.name = currentUser.first_name + currentUser.last_name;
      user.email = currentUser.email;
      this.setState({ user });
    }
  }

  render() {
    return (
      <div>
        <div className="btn-grp" id="user-menu">
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              style={{ borderRadius: "70px" }}
            >
              <i className="fas fa-user"></i>
            </button>
            <div
              className="dropdown-menu dropdown-menu-right"
              aria-labelledby="dropdownMenuButton"
            >
              <div id="custom-user-left">
                <i className="fas fa-user"></i>
              </div>
              <div id="custom-user-right">
                <div>{this.state.user.name}</div>
                <div>{this.state.user.email}</div>
                <div>
                  <li className=" ">
                    <Link to="/logout">Sign out</Link>
                  </li>
                  {auth.getCurrentUser() === null ? null : (
                    <div>
                      <li className=" ">
                        <Link to="/dashboard">My Collections</Link>
                      </li>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UserInfo;
