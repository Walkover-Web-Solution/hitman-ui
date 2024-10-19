import React from 'react'
import axios from 'axios';
import Combination from './combination/combination';
import PublicSearchBar from './publicSearchBar/publicSearchBar';
import CollectionDetails from './collectionDetails/collectionDetails';
import './publicSidebar.scss';

export default async function PublicSidebar({ sidebarData }) {
    const collectionDetails = sidebarData?.data?.collections[Object.keys(sidebarData?.data?.collections)[0]] || {}
    const invisiblePageId = collectionDetails?.rootParentId || '';
    const pages = sidebarData?.data?.pages || {}
    return (
        <div className='public-sidebar-container overflow-auto mt-2 mb-3'>
            {!collectionDetails?.docProperties?.defaultHeader && <CollectionDetails collectionDetails={sidebarData?.data?.collections[Object.keys(sidebarData?.data?.collections)[0]]} />}
            {/* <PublicSearchBar /> */}
            <Combination pages={pages} invisiblePageId={invisiblePageId} />
        </div>
    )
}