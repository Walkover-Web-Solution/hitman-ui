import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';
import { store, persistor } from './store/store';
import App from './App';
import { sentryIntegration } from './components/common/utility';
import './index.scss';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import '../src/components/main/responsive.scss';
import { ModalProvider } from './components/common/layeredModal/context/ModalContext';

if (process.env.REACT_APP_ENV !== 'local') {
  sentryIntegration();
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ModalProvider  >
            <App />
          </ModalProvider>
        </QueryClientProvider>
      </PersistGate>
    </BrowserRouter>
  </Provider>
);
