import React from 'react';
import PublicEndpoint from '../../../components/publicEndpoint/publicEndpoint'
import Providers from '../../providers/providers';
import generalApiService from '../../../services/generalApiService';


export default async function Page({ params, searchParams }) {
    const queryParams = searchParams // Access query parameters
    const slug = params
    console.log('Query Params:', queryParams);
    console.log('Path:', slug);
    // const response = await generalApiService.getPublishedContentByPath(queryParamsString)

    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
        </div>
    );
}