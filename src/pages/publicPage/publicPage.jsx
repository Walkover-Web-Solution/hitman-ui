import React, { useEffect } from 'react'
import { isOnPublishedPage, SESSION_STORAGE_KEY } from '../../components/common/utility'
import RenderPageContent from '../../components/pages/renderPageContent'
import DisplayUserAndModifiedData from '../../components/common/userService'
import { useSelector } from 'react-redux'
import { getPublishedContentByIdAndType } from '../../services/generalApiService'
import { useQuery } from 'react-query'
import { IoDocumentTextOutline } from 'react-icons/io5'
import Footer from '../../components/main/Footer'
import ApiDocReview from '../../components/apiDocReview/apiDocReview'
import './publicPage.scss'

const queryConfig = {
    refetchOnWindowFocus: false,
    cacheTime: 5000000,
    enabled: true,
    staleTime: 600000, retry: 2
}

function PublicPage() {
    let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)

    const { pages, users } = useSelector((state) => ({
        pages: state.pages,
        users: state.users,
    }))

    const getPagePublishedData = async () => {
        const data = await getPublishedContentByIdAndType(currentIdToShow, pages?.[currentIdToShow]?.type)
        return data;
    }

    let { data } = useQuery(['pageContent', currentIdToShow], getPagePublishedData, queryConfig)

    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    useEffect(() => {
        if (isOnPublishedPage() && typeof window.SendDataToChatbot === 'function' && (pages?.[idToRender]?.type === 1 || pages?.[idToRender]?.type === 3)) {
            window.SendDataToChatbot({
                bridgeName: 'page',
                threadId: `${users?.currentUser?.id}-${idToRender}`,
                variables: { collectionId: pages[idToRender]?.collectionId }
            })
        }
    }, [idToRender])


    return (
        <div className={`custom-display-page ${isOnPublishedPage() ? 'custom-display-public-page' : ''}`}>
            <div className='page-wrapper d-flex flex-column justify-content-between'>
                {data ? (
                    <div className='pageText d-flex justify-content-center aling-items-start'>
                        <RenderPageContent pageContent={data} />
                    </div>
                ) : (
                    <div className='d-flex flex-column justify-content-center align-items-center empty-heading-for-page'>
                        <IoDocumentTextOutline size={140} color='gray' />
                        <span className='empty-line'>
                            {pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name} is empty
                        </span>
                        <span className='mt-1 d-inline-block Modified-at fs-4'>
                            <DisplayUserAndModifiedData />
                        </span>
                    </div>
                )}
                <div>
                    <ApiDocReview />
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default PublicPage