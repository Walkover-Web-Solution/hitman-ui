import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import collectionsReducer from "../components/collections/redux/collectionsReducer";
import versionsReducer from "../components/collectionVersions/redux/collectionVersionsReducer";
import endpointsReducer from "../components/endpoints/redux/endpointsReducer";
import environmentsReducer from "../components/environments/redux/environmentsReducer";
import groupsReducer from "../components/groups/redux/groupsReducer";
import pagesReducer from "../components/pages/redux/pagesReducer";
import teamsReducer from "../components/teams/redux/teamsReducer";
import teamUsersReducer from "../components/teamUsers/redux/teamUsersReducer";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  collections: collectionsReducer,
  versions: versionsReducer,
  groups: groupsReducer,
  pages: pagesReducer,
  endpoints: endpointsReducer,
  environment: environmentsReducer,
  teamUsers: teamUsersReducer,
  teams: teamsReducer
});
const store = createStore(rootReducer, storeEnhancers(applyMiddleware(thunk)));

export default store;
