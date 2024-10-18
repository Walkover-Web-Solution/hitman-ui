import React from 'react'
import Documents from '../documents/documents'
import Endpoints from '../endpoints/endpoints'

export default function Combination({ pages, invisiblePageId = '', incomingPageId = '' }) {
    let pageId = incomingPageId ? incomingPageId : invisiblePageId;
    return (
        <div>
            {pages[pageId]?.child?.map((childId) => {
                const type = pages?.[childId]?.type || null;
                switch (type) {
                    case 1:
                    case 3:
                        return <Documents pages={pages} docId={childId} />
                    case 4:
                    case 5:
                        return <Endpoints pages={pages} endpointId={childId} />
                    case 2:
                        return <Combination pages={pages} incomingPageId={childId} />
                    default:
                        return null;
                }
            })}
        </div>
    )
}