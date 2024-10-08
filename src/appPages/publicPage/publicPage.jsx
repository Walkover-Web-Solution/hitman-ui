import React from 'react'
import RenderPageContent from '../../components/pages/renderPageContent'
import DisplayUserAndModifiedData from '../../components/common/userService'
import { IoDocumentTextOutline } from 'react-icons/io5'
import ApiDocReview from '../../components/apiDocReview/apiDocReview'
import Providers from '../../app/providers/providers'
import './publicPage.scss'


function PublicPage(props) {
    // let currentIdToShow
    // if (typeof window !== 'undefined') {
    //     currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW);
    // }
    // useEffect(() => {
    //     if (isOnPublishedPage() && typeof window.SendDataToChatbot === 'function' && (pages?.[currentIdToShow]?.type === 1 || pages?.[currentIdToShow]?.type === 3)) {
    //         window.SendDataToChatbot({
    //             bridgeName: 'page',
    //             threadId: `${currentIdToShow}`,
    //             variables: {
    //                 collectionId: pages[currentIdToShow]?.collectionId,
    //                 functionType: import.meta.env.VITE_ENV === 'prod' ? functionTypes.prod : functionTypes.dev
    //             }
    //         })
    //     }
    // }, [currentIdToShow])

    return (
        <div className={`custom-display-page custom-display-public-page `}>
            <div className={`page-wrapper d-flex flex-column ${props?.pageContentDataSSR?.contents ? 'justify-content-between' : 'justify-content-center'}`}>
                {props?.pageContentDataSSR?.contents ? (
                    <div className='pageText d-flex justify-content-center aling-items-start'>
                        <RenderPageContent pageContentDataSSR={props?.pageContentDataSSR} />
                    </div>
                ) : (
                    <div className='d-flex flex-column justify-content-center align-items-center empty-heading-for-page'>
                        <IoDocumentTextOutline size={140} color='gray' />
                        <span className='empty-line'>
                            {props?.pageContentDataSSR?.name} is empty
                        </span>
                        <span className='mt-1 d-inline-block Modified-at font-12'>
                            <Providers>
                                <DisplayUserAndModifiedData />
                            </Providers>
                        </span>
                    </div>
                )}
                {props?.pageContentDataSSR?.contents && <div className='my-5'>
                    <Providers>
                        <ApiDocReview />
                    </Providers>
                </div>}
            </div>
        </div>
    )
}

export default PublicPage