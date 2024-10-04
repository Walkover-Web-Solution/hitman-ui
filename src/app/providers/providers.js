"use client"
import React from 'react'
import { persistor, store } from '../../store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { Provider } from 'react-redux'
import '../../components/main/responsive.scss'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import '../../index.scss'
import 'react-toastify/dist/ReactToastify.css'
import { Slide, ToastContainer } from 'react-toastify'
import IconButton from '@/components/common/iconButton';
import { MdClose } from 'react-icons/md'

const queryClient = new QueryClient()

export default function Providers({ children }) {
    return (
        <Provider store={store}>
            <ToastContainer
                position='bottom-left'
                autoClose={1500}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                theme='dark'
                transition={Slide}
                toastClassName='custom-class'
                closeButton={<IconButton variant='sm'><MdClose size={18} /></IconButton>}
            />
            <PersistGate loading={null} persistor={persistor}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </PersistGate>
        </Provider>
    )
}