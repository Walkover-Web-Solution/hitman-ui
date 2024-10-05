import React from 'react';
import PublicEndpoint from '../../../components/publicEndpoint/publicEndpoint'
import Providers from '../../providers/providers';


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