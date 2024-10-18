import React from 'react'
import axios from 'axios';
import Combination from './combination/combination';
import PublicSearchBar from './publicSearchBar/publicSearchBar';
import CollectionDetails from './collectionDetails/collectionDetails';
import Providers from 'src/app/providers/providers';

let apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default async function PublicSidebar({ searchParams, customDomain }) {

    const getSidebarData = async () => {
        let queryString = '';
        if (customDomain) {
            queryString = `?customDomain=${customDomain}`
        }
        else {
            queryString = `?collectionId=${searchParams.collectionId}`
        }
        try {
            const sidebarData = await axios.get(apiUrl + `/orgs/${null}/getSideBarData${queryString}`)
            return sidebarData;
        }
        catch (error) {
            throw error
        }
    }

    let sidebarData = {};
    try {
        sidebarData = await getSidebarData();
    }
    catch (error) {
        console.error(error);
        sidebarData.error = error;
        return null;
    }

    const collectionDetails = sidebarData.data.collections[Object.keys(sidebarData?.data?.collections)[0]] || {}
    const invisiblePageId = collectionDetails.rootParentId || '';
    const pages = sidebarData?.data?.pages || {}
    return (
        <div className='p-5 h-100vh overflow-scroll'>
            <CollectionDetails collectionDetails={sidebarData.data.collections[Object.keys(sidebarData?.data?.collections)[0]]} />
            <Providers>
                <PublicSearchBar />
            </Providers>
            <Combination pages={pages} invisiblePageId={invisiblePageId} />
        </div>
    )
}