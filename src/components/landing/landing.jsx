import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class Landing extends Component {
    state = {}

    redirectToMarketPlace() {
        this.props.history.push({
            pathname: "/marketPlace"
        })
    }

    redirectToDashboard() {
        this.props.history.push({
            pathname: "/dashboard"
        })
    }

    redirectToLogin() {
        return
    }

    render() {
        return <div>
            <h1>HITMAN</h1>
            <Button onClick={() => this.redirectToMarketPlace()} variant="outline-warning">Market Place</Button>{' '}
            <Button onClick={() => this.redirectToDashboard()} variant="outline-warning">DRY RUN</Button>{' '}
            <Button onClick={() => this.redirectToLogin()} variant="warning">Login/Signup</Button>{' '}
        </div>
    }
}

export default Landing;