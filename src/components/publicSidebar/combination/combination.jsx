import React from 'react'
import ParentDocument from '../parentDocument/parentDocument'
import Endpoints from '../endpoints/endpoints'
import SubDocument from '../subDocument/subDocument';

export default function Combination({ pages, invisiblePageId = '', incomingPageId = '' }) {
    let pageId = incomingPageId ? incomingPageId : invisiblePageId;
    return (
        <div>
            {pages[pageId]?.child?.map((childId) => {
                const type = pages?.[childId]?.type || null;
                switch (type) {
                    case 1:
                        return <ParentDocument pages={pages} docId={childId} />
                    case 3:
                        return <SubDocument pages={pages} subDocId={childId} />
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