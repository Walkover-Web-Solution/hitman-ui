import React from 'react';
import PublicEndpoint from '../../../components/publicEndpoint/publicEndpoint'
import Providers from '../../providers/providers';


export default async function Page({ params, searchParams }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const queryParams = searchParams;
    const slug = params
    console.log('Query Params:', queryParams);
    console.log('Path:', slug);
    const queryParamsString = '?collectionId=YecLEi9wSYig&public=true'
    // const response = await generalApiService.getPublishedContentByPath('collectionId=YecLEi9wSYig')
    const response = await fetch(apiUrl + `/getPublishedDataByPath${queryParamsString}`)
    console.log(response)

    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
        </div>
    );
}