import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import collectionsReducer from "../components/collections/redux/collectionsReducer";
import versionsReducer from "../components/collectionVersions/redux/collectionVersionsReducer";
import groupsReducer from "../components/groups/redux/groupsReducer";
import pagesReducer from "../components/pages/redux/pagesReducer";
import endpointsReducer from "../components/endpoints/redux/endpointsReducer";
import environmentsReducer from "../components/environments/redux/environmentsReducer";
import thunk from "redux-thunk";
import { logger } from "redux-logger";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  collections: collectionsReducer,
  versions: versionsReducer,
  groups: groupsReducer,
  pages: pagesReducer,
  endpoints: endpointsReducer,
  environment: environmentsReducer
});
const store = createStore(rootReducer, storeEnhancers(applyMiddleware(thunk)));

export default store;
