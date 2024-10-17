import React from 'react'
import RenderPublicPageContent from '../p/[...slug]/page'
import { headers } from 'next/headers';

export default function Page({ params, searchParams }) {
    const headersList = headers();
    let host = headersList.get('host');
    console.log(host, params.slug.join('/'), '__domain__')
    if (host.includes('127.0.0.1')) host = '127.0.0.1'
    if (host !== 'localhost:3000') return <RenderPublicPageContent params={params} searchParams={searchParams} customDomain={host} />
}