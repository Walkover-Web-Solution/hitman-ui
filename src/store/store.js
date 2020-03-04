import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import collectionsReducer from "../components/collections/collectionsReducer";
import endpointsReducer from "../components/endpoints/endpointsReducer";
import thunk from "redux-thunk";
import { logger } from "redux-logger";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  collections: collectionsReducer,
  endpoints: endpointsReducer
});
const store = createStore(
  rootReducer,
  storeEnhancers(applyMiddleware(thunk, logger))
);

export default store;
