import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import collectionsReducer from "../components/collections/collectionsReducer";
import endpointsReducer from "../components/endpoints/endpointsReducer";
import groupsReducer from "../components/groups/groupsReducer";
import thunk from "redux-thunk";
import { logger } from "redux-logger";
import versionsReducer from '../components/collectionVersions/collectionVersionsReducer';

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  collections: collectionsReducer,
  versions: versionsReducer,
  groups: groupsReducer,
  endpoints: endpointsReducer
});
const store = createStore(
    rootReducer,
    storeEnhancers(applyMiddleware(thunk, logger))
);

export default store;