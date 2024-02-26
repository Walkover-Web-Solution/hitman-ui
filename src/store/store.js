import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import collectionsReducer from '../components/collections/redux/collectionsReducer'
import environmentsReducer from '../components/environments/redux/environmentsReducer'
import groupsReducer from '../components/groups/redux/groupsReducer'
import pagesReducer from '../components/pages/redux/pagesReducer'
import tabsReducer from '../components/tabs/redux/tabsReducer'
import cookiesReducer from '../components/cookies/redux/cookiesReducer'
import modalsReducer from '../components/modals/redux/modalsReducer'
import historyReducer from '../components/history/redux/historyReducer'
import toggleResponseReducer from '../components/common/redux/toggleResponse/toggleResponseReducer'
import publishDocsReducer from '../components/publishDocs/redux/publishDocsReducer'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import clientDataReducer from './clientData/clientDataReducer'

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const rootReducer = combineReducers({
  collections: collectionsReducer,
  groups: groupsReducer,
  pages: pagesReducer,
  environment: environmentsReducer,
  tabs: tabsReducer,
  history: historyReducer,
  cookies: cookiesReducer,
  modals: modalsReducer,
  responseView: toggleResponseReducer,
  feedbacks: publishDocsReducer,
  clientData: clientDataReducer
})

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = createStore(persistedReducer, storeEnhancers({ trace: true })(applyMiddleware(thunk)));
const persistor = persistStore(store)

export { store, persistor }
