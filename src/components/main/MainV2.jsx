import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import ContentPanel from './contentPanel'
import ContentPanel1 from './contentPanel1'
import './main.scss'
import SideBarV2 from './sideBarV2'
import SideBar from './sidebar'
import { fetchAllCookies, fetchAllCookiesFromLocalStorage } from '../cookies/redux/cookiesActions'
import { isDesktop } from 'react-device-detect'
import OnlineStatus from '../onlineStatus/onlineStatus'
import DesktopAppDownloadModal from './desktopAppPrompt'
import UpdateStatus from './updateStatus'
import CollectionModal from '../collections/collectionsModal'
import NoCollectionIcon from '../../assets/icons/collection.svg'
import { getCurrentUser, getUserData, getCurrentOrg, getOrgList, getProxyToken } from '../auth/authServiceV2'
import { addCollectionAndPages } from '../redux/generalActions'
import SplitPane from '../splitPane/splitPane'
import { addUserData } from '../auth/redux/usersRedux/userAction'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_all_cookies: () => dispatch(fetchAllCookies()),
    fetch_all_cookies_from_local: () => dispatch(fetchAllCookiesFromLocalStorage()),
    add_collection_and_pages: (orgId) => dispatch(addCollectionAndPages(orgId)),
    add_user: (userData) => dispatch(addUserData(userData))
  }
}

const MainV2 = (props) => {
  const [tabs, setTabs] = useState([])
  const [defaultTabIndex, setDefaultTabIndex] = useState(0)
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddCollectionPage, setShowAddCollectionPage] = useState(true)
  const [currentEnvironment, setCurrentEnvironment] = useState(null)

  useEffect(() => {
    const initialize = async () => {
      const token = getProxyToken()
      if (!token) {
        setLoading(false)
        return
      }

      let users = await getUserData(token)
      if (users) props.add_user(users)

      if (getCurrentUser() && getOrgList() && getCurrentOrg()) {
        let orgId = props.match.params.orgId
        if (!orgId) {
          orgId = getOrgList()[0]?.id
          props.history.push({
            pathname: `/orgs/${orgId}/dashboard`
          })
        } else {
          await fetchAll()
          props.add_collection_and_pages(orgId)
        }
      } else {
        props.history.push({
          pathname: '/login'
        })
      }
      setLoading(false)
    }

    initialize()
  }, [])

  const fetchAll = async () => {
    props.fetch_all_cookies()
  }

  const setVisitedOrgs = () => {
    const orgId = props.match.params.orgId
    const org = {}
    org[orgId] = true
    window.localStorage.setItem('visitedOrgs', JSON.stringify(org))
  }

  const showCollectionDashboard = () => {
    if (!getCurrentUser()) {
      return false
    }
    const collectionLength = Object.keys(props.collections).length
    const orgId = props.match.params.orgId
    const temp = JSON.parse(window.localStorage.getItem('visitedOrgs'))
    return !(temp && temp[orgId]) && collectionLength === 0 && showAddCollectionPage
  }

  const addCollectionDialog = () =>
    showAddCollectionModal && (
      <CollectionModal title='Add Collection' onHide={() => setShowAddCollectionModal(false)} show={showAddCollectionModal} />
    )

  const renderLandingDashboard = () => (
    <>
      {/* {addCollectionDialog()} */}
      <div className='no-collection h-100 d-flex flex-d-col justify-content-center align-items-center flex-wrap'>
        <img src={NoCollectionIcon} alt='' />
        <p className='mb-4'>Add your first collection for API testing and Public API Doc</p>
        <button onClick={() => setShowAddCollectionModal(true)} className='btn btn-primary'>
          + Add collection
        </button>
        <p className='mt-3'>Or</p>
        <div
          className='text-link'
          onClick={() => {
            setVisitedOrgs()
            setShowAddCollectionPage(false)
          }}
        >
          Try Out Without a Collection
        </div>
      </div>
    </>
  )

  return (
    <>
      {loading ? (
        <div className='custom-loading-container'>
          <div className='loading-content'>
            <button className='spinner-border' />
            <p className='mt-3'>Loading</p>
          </div>
        </div>
      ) : (
        <div>
          {!isDesktop && (
            <div className='mobile-warning'>Looks like you have opened it on a mobile device. It looks better on a desktop device.</div>
          )}
          <div className='custom-main-container'>
            <DesktopAppDownloadModal history={props.history} location={props.location} match={props.match} />
            <OnlineStatus />
            <div className='main-panel-wrapper'>
              <SplitPane split='vertical' className='split-sidebar'>
                <SideBarV2 tabs={tabs} set_tabs={setTabs} default_tab_index={defaultTabIndex} />
                {showCollectionDashboard() ? (
                  renderLandingDashboard()
                ) : (
                  <ContentPanel1
                    {...props}
                    set_environment={setCurrentEnvironment}
                    set_tabs={setTabs}
                    default_tab_index={defaultTabIndex}
                  />
                )}
              </SplitPane>
            </div>
            <UpdateStatus />
          </div>
        </div>
      )}
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(MainV2)
