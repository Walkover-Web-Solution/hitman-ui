import React, { Component } from 'react';

class Landing extends Component {
    state = {}

    render() {
        this.props.history.push({
            pathname: "/dashboard"
        })
        return (<div></div>)

    }
}

export default Landing;