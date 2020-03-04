import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import collectionsReducer from "../components/collections/collectionsReducer";
<<<<<<< HEAD
import endpointsReducer from "../components/endpoints/endpointsReducer";
import groupsReducer from "../components/groups/groupsReducer";
=======
>>>>>>> versions-redux
import thunk from "redux-thunk";
import { logger } from "redux-logger";
import versionsReducer from '../components/collectionVersions/collectionVersionsReducer';

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

<<<<<<< HEAD
const rootReducer = combineReducers({
  collections: collectionsReducer,
  groups: groupsReducer,
  endpoints: endpointsReducer
});
=======
const rootReducer = combineReducers({ collections: collectionsReducer, versions: versionsReducer });

>>>>>>> versions-redux
const store = createStore(
    rootReducer,
    storeEnhancers(applyMiddleware(thunk, logger))
);

export default store;