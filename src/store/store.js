import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import collectionsReducer from "../components/collections/collectionsReducer";
import thunk from "redux-thunk";
import { logger } from "redux-logger";
import versionsReducer from "../components/collectionVersions/collectionVersionsReducer";
import pagesReducer from "../components/pages/pagesReducer";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
    collections: collectionsReducer,
    versions: versionsReducer,
    pages: pagesReducer
});

const store = createStore(
    rootReducer,
    storeEnhancers(applyMiddleware(thunk, logger))
);

export default store;