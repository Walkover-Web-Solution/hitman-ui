"use client"
import React from 'react'
import { persistor, store } from '../../store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { Provider } from 'react-redux'
import '../../index.scss'
import '../../components/main/global-style.scss'
import '../../components/main/main.scss'
import '../../components/main/responsive.scss'
import '../../components/main/sidebar.scss'
import '../../components/main/updateStatus.scss'
import '../../components/main/userProfile.scss'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'react-toastify/dist/ReactToastify.css'

const queryClient = new QueryClient()

export default function ReduxProvider({ children }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </PersistGate>
        </Provider>
    )
}