import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import rootReducer from "../components/collections/collectionsReducer";
import thunk from "redux-thunk";
import { logger } from "redux-logger";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// const rootReducer = combineReducers({ collectionsReducer });
const store = createStore(
  rootReducer,
  storeEnhancers(applyMiddleware(thunk, logger))
);

export default store;
