import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import collectionsReducer from '../components/collections/redux/collectionsReducer'
import environmentsReducer from '../components/environments/redux/environmentsReducer'
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
import tokenDataReducer from './tokenData/tokenDataReducers'
import urlMappingReducer from '../components/collections/redux/urlReducer'

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const rootReducer = combineReducers({
  collections: collectionsReducer,
  pages: pagesReducer,
  environment: environmentsReducer,
  tabs: tabsReducer,
  history: historyReducer,
  cookies: cookiesReducer,
  modals: modalsReducer,
  responseView: toggleResponseReducer,
  feedbacks: publishDocsReducer,
  clientData: clientDataReducer,
  tokenData: tokenDataReducer,
  urlMapping: urlMappingReducer
})

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = createStore(persistedReducer, storeEnhancers(applyMiddleware(thunk)))
const persistor = persistStore(store)

export { store, persistor }