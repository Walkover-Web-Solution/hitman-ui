import { createStore, applyMiddleware, compose } from "redux";
import rootReducer from "../reducers/collectionsReducer";
import createSagaMiddleware from "redux-saga";
import apiSaga from "../actions/sagas";
import { logger } from "redux-logger";

const initialiseSagaMiddleware = createSagaMiddleware();

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  storeEnhancers(applyMiddleware(initialiseSagaMiddleware, logger))
);

initialiseSagaMiddleware.run(apiSaga);

export default store;
