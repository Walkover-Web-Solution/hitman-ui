import React from 'react'
import axios from 'axios';
import Combination from './combination/combination';
import PublicSearchBar from './publicSearchBar/publicSearchBar';
import CollectionDetails from './collectionDetails/collectionDetails';
import './publicSidebar.scss';

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
        <div className='public-sidebar-container overflow-auto px-3 mt-3 mr-5'>
            {!collectionDetails?.docProperties?.defaultHeader && <CollectionDetails collectionDetails={sidebarData.data.collections[Object.keys(sidebarData?.data?.collections)[0]]} />}
            {/* <PublicSearchBar /> */}
            <Combination pages={pages} invisiblePageId={invisiblePageId} />
        </div>
    )
}