import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import collectionsReducer from '../components/collections/redux/collectionsReducer'
import versionsReducer from '../components/collectionVersions/redux/collectionVersionsReducer'
import endpointsReducer from '../components/endpoints/redux/endpointsReducer'
import environmentsReducer from '../components/environments/redux/environmentsReducer'
import groupsReducer from '../components/groups/redux/groupsReducer'
import pagesReducer from '../components/pages/redux/pagesReducer'
import tabsReducer from '../components/tabs/redux/tabsReducer'
import cookiesReducer from '../components/cookies/redux/cookiesReducer'
import modalsReducer from '../components/modals/redux/modalsReducer'
import historyReducer from '../components/history/redux/historyReducer'
import sidebarReducer from '../components/main/sidebar/redux/sidebarReducer'
import toggleResponseReducer from '../components/common/redux/toggleResponse/toggleResponseReducer'
import publishDocsReducer from '../components/publishDocs/redux/publishDocsReducer'

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const rootReducer = combineReducers({
  collections: collectionsReducer,
  versions: versionsReducer,
  groups: groupsReducer,
  pages: pagesReducer,
  endpoints: endpointsReducer,
  environment: environmentsReducer,
  tabs: tabsReducer,
  history: historyReducer,
  cookies: cookiesReducer,
  modals: modalsReducer,
  sidebar: sidebarReducer,
  responseView: toggleResponseReducer,
  feedbacks: publishDocsReducer
})
const store = createStore(rootReducer, storeEnhancers(applyMiddleware(thunk)))

export default store
