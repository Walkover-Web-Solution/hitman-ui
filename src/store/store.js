import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import collectionsReducer from "../components/collections/collectionsReducer";
import versionsReducer from "../components/collectionVersions/collectionVersionsReducer";
import groupsReducer from "../components/groups/groupsReducer";
import pagesReducer from "../components/pages/pagesReducer";
import endpointsReducer from "../components/endpoints/endpointsReducer";
import environmentsReducer from "../components/environments/environmentsReducer";
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
const store = createStore(
  rootReducer,
  storeEnhancers(applyMiddleware(thunk, logger))
);

export default store;
