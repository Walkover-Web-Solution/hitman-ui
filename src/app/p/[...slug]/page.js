import React from 'react';
import PublicEndpoint from '../../../components/publicEndpoint/publicEndpoint'
import Providers from '../../providers/providers';


export default async function Page({ params, searchParams }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const queryParams = searchParams;
    const slug = params
    console.log('Query Params:', queryParams);
    console.log('Path:', slug);
    const queryParamsString = '?collectionId=YecLEi9wSYig&public=true&path=sms/sms-logs'
    const response = await fetch(apiUrl + `/getPublishedDataByPath${queryParamsString}`)
    const data = await response.json();
    console.log(data)

    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
        </div>
    );
}