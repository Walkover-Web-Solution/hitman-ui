import React, { Component } from 'react'
import { Route, Switch, Link } from 'react-router-dom'
import SideBar from './sidebar'
import Environments from './environments'
import DisplayPage from './displayPage'
import EditPage from './editPage'
import DisplayEndpoint from './displayEndpoint'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

class Main extends Component {
  state = {
    currentEnvironment: { id: null, name: 'No Environment' }
  }
  setEnvironment(environment) {
    this.setState({ currentEnvironment: environment })
  }

  render() {
    return (
      <div>
        <ToastContainer />
        <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
          <a className='navbar-brand col-sm-3 col-md-2 mr-0' href='/'>
            HITMAN
          </a>
          <input
            className='form-control form-control-dark w-100'
            type='text'
            placeholder='Search'
            aria-label='Search'
          />
          <ul className='navbar-nav px-3'>
            <li className='nav-item text-nowrap'>
              <Link to='/logout'>Sign out</Link>
            </li>
          </ul>
        </nav>
        <div className='container-fluid'>
          <div className='row'>
            <Route>
              <SideBar {...this.props} />
            </Route>
            <ToastContainer />
            <main
              role='main'
              className='main col-md-9 ml-sm-auto col-lg-9 px-4 '
            >
              <Route>
                <Environments
                  {...this.props}
                  set_environment={this.setEnvironment.bind(this)}
                />
              </Route>
              <div className='d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom'></div>
              <ToastContainer />
              <Switch>
                <Route
                  path='/dashboard/collections/endpoints'
                  render={props => (
                    <DisplayEndpoint
                      {...props}
                      environment={this.state.currentEnvironment}
                    />
                  )}
                />
                <Route
                  path='/dashboard/collections/endpoints/:endpointId'
                  render={props => <DisplayEndpoint {...props} />}
                />
                <Route
                  path='/dashboard/collections/pages/:pageid/edit'
                  render={props => <EditPage {...props} />}
                />
                <Route
                  path='/dashboard/collections/pages/:pageid'
                  render={props => <DisplayPage {...props} />}
                />
              </Switch>
            </main>
          </div>
        </div>
      </div>
    )
  }
}

export default Main
