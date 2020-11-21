import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "./notFound.scss";

class NotFound extends Component {
  state = {};

  navigateToHome() {
    this.props.history.push({ pathname: "/" });
  }
  render() {
    // const msg = `Currently this collection has no public endpoints and pages.\nMake any   endpoint or page public.`;
    if (this.props.location.collection) {
      return (
        <div className="main-div">
          {" "}
          <div className="mainbox">
            <div className="err">4</div>
            <i className="far fa-question-circle fa-spin"></i>
            <div className="err2">4</div>
            <div className="msg">
              {" "}
              Currently this collection has no public endpoints and pages. Make
              any endpoint or page public.
              <p>
                Let's go{" "}
                <Button variant="link" onClick={() => this.navigateToHome()}>
                  home{" "}
                </Button>
                and try from there.
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="main-div">
          {" "}
          <div className="mainbox">
            <div className="err">4</div>
            <i className="far fa-question-circle fa-spin"></i>
            <div className="err2">4</div>
            <div class="msg">
              Maybe this page moved? Got deleted? Is hiding out in quarantine?
              Never existed in the first place?
              <p>
                Let's go{" "}
                <Button variant="link" onClick={() => this.navigateToHome()}>
                  home
                </Button>{" "}
                and try from there.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default NotFound;
