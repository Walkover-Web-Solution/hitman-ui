"use client"
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateMode } from '../../../store/clientData/clientDataActions';
import Provider from '../../providers/providers'
import { useRouter } from 'next/navigation';

const PageProvider = ({ children }) => {
    return (
        <Provider>
            {children}
        </Provider>
    )
}

const TokenGeneratedPage = () => {
    // const dispatch = useDispatch();
    // const router = useRouter()
    // useEffect(() => {
    //     dispatch(updateMode({ mode: true }));
    // }, [])

    return (
        <div className='d-flex justify-content-center align-items-center h-100vh'>
            <div className='spinner-border' role='status'>
                <span className='sr-only'>Loading...</span>
            </div>
        </div>
    )
}

export default function Page({ searchParams }) {
    return (
        <PageProvider>
            <TokenGeneratedPage  />
        </PageProvider>
    )
}