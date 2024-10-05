import React from 'react';
import Providers from '../providers/providers';
import PublicEndpoint from '@/components/publicEndpoint/publicEndpoint';


export default async function Page({ params, searchParams }) {
    const queryParams = searchParams
    console.log('Query Params:', queryParams);
    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
        </div>
    );
}