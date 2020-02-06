import React, { Component } from 'react'
import { Route, Switch, Link } from 'react-router-dom'
import SideBar from './sidebar'
import Environments from './environments'
import DisplayPage from './displayPage'
import { Redirect } from 'react-router-dom'
import EditPage from './editPage'
import pageService from '../services/pageService'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

class Main extends Component {
  async handleUpdatePage (editedPage, pageId, versionId) {
    const { data: editPage } = await pageService.updatePage(pageId, editedPage)
  }

  render () {
    // if (this.props.title === 'Add New Version Page') {

    // }
    // if (this.props.location.data && this.props.location.data.groupId === '') {
    //   const data = { ...this.props.location.data }
    //   delete data.pageId
    //   delete data.versionId
    //   delete data.groupId
    //   this.handleUpdatePage(
    //     data,
    //     this.props.location.data.pageId,
    //     this.props.location.data.versionId
    //   )
    // } else if (
    //   this.props.location.data &&
    //   this.props.location.data.versionId === ''
    // ) {
    //   this.handleAddGroupPage(
    //     this.props.location.data.versionId,
    //     this.props.location.data.groupId,
    //     this.props.location.data
    //   )
    // }

    return (
      <div>
        <ToastContainer />
        <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
          <a className='navbar-brand col-sm-3 col-md-2 mr-0' href='/'>
            Company name
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
              <SideBar />
            </Route>

            <main
              role='main'
              className='main col-md-9 ml-sm-auto col-lg-9 px-4'
            >
              <Route>
                <Environments {...this.props} />
              </Route>
              <div className='d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom'>
                <h1 className='h2'>Dashboard</h1>
              </div>

              <Switch>
                {/* <Route
                  path='/dashboard/collections/pages/:pageid/new'
                  render={props => <EditPage page={this.props.location.page} />}
                /> */}
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
