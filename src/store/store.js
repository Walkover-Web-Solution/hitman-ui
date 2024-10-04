import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk'; // Correctly import thunk as a default export
import collectionsReducer from '@/components/collections/redux/collectionsReducer';
import environmentsReducer from '@/components/environments/redux/environmentsReducer';
import tabsReducer from '@/components/tabs/redux/tabsReducer';
import pagesReducer from '@/components/pages/redux/pagesReducer';
import cookiesReducer from '@/components/cookies/redux/cookiesReducer';
import modalsReducer from '@/components/modals/redux/modalsReducer';
import historyReducer from '@/components/history/redux/historyReducer';
import toggleResponseReducer from '@/components/common/redux/toggleResponse/toggleResponseReducer';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import clientDataReducer from './clientData/clientDataReducer';
import tokenDataReducer from './tokenData/tokenDataReducers';
import userReducer from '@/components/auth/redux/usersRedux/userReducer';
import organizationReducer from '@/components/auth/redux/organizationRedux/organizationReducer';
import automationReducer from '@/components/collections/runAutomation/redux/runAutomationReducer';
import createNewPublicEnvReducer from '@/components/publishDocs/redux/publicEnvReducer';

// Combine your reducers
const rootReducer = combineReducers({
  collections: collectionsReducer,
  pages: pagesReducer,
  environment: environmentsReducer,
  tabs: tabsReducer,
  history: historyReducer,
  cookies: cookiesReducer,
  modals: modalsReducer,
  responseView: toggleResponseReducer,
  clientData: clientDataReducer,
  tokenData: tokenDataReducer,
  users: userReducer,
  organizations: organizationReducer,
  automation: automationReducer,
  publicEnv: createNewPublicEnvReducer,
});

// Persist configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Use configureStore from Redux Toolkit
const store = configureStore({
  reducer: persistedReducer, // Apply persisted reducer
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk), // Add thunk middleware correctly
  devTools: 'local' !== 'production', // Enable Redux DevTools in development mode only
});

// Persist the store
const persistor = persistStore(store);

// Export the store and persistor
export { store, persistor };
