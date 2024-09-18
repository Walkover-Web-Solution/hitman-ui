import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import './publishModal.scss'
import { useNavigate, useParams } from 'react-router';
import { getUrlPathById, SESSION_STORAGE_KEY } from '../common/utility';
import { useSelector } from 'react-redux';
import { GoLink } from "react-icons/go";
import CopyToClipboard from 'react-copy-to-clipboard';

function PublishModal({ onPublish, onUnpublish, id, collectionId, isContentChanged }) {
    const params = useParams()
    const navigate = useNavigate()

    const [publishclicked, setPublishClicked] = useState(false);
    const [disabledValue, setDisabledValue] = useState(null);
    const { pages, customDomain, isPublished } = useSelector((state) => ({
        pages: state.pages,
        customDomain: state.collections?.[params.collectionId]?.customDomain || '',
        isPublished: state?.pages[state.tabs.activeTabId].isPublished,
    }));

    useEffect(() => {
        sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId);
        let pathName = getUrlPathById(id, pages);
        setDisabledValue(`/${pathName}`);
    }, [collectionId, id, pages]);

    const visiblePath1 = customDomain ? `https://${customDomain}/` : `${import.meta.env.VITE_UI_URL}/p`
    const visiblePath2 = 'https://techdoc.walkover.in/p'

    const handlePublishClick = () => {
        setPublishClicked(true);
        sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId)
        let pathName = getUrlPathById(id, pages)
        setDisabledValue(`/${pathName}`)
        onPublish()
    }

    const handleUnpublishClick = () => {
        setPublishClicked(false);
        onUnpublish()
    }

    const handleViewSite = () => {
        const path = `/p${disabledValue}`;
        navigate(path, { replace: true });
    }

    return (
        <div className='custom-modal'>
            <div className='modal-body d-flex align-items-center'>
                <div className='d-flex align-items-center wrapper'>
                    <div >
                        {!isPublished ? (
                            <div className='d-flex align-items-center text-container'>
                                <div className='Publish-to-web'>
                                    Publish to Web
                                </div>
                                <div className='create d-flex align-items-center pb-4'> Create a website with Techdoc </div>
                            </div>
                        ) : (
                            <div className="custom-input-wrapper d-flex align-items-center">
                                <div className='align-items-center editable-input cursor-pointer w-50' >
                                    <div className='d-flex align-items-center input'>
                                        <div className='value'>
                                            {visiblePath2}
                                        </div>
                                    </div>
                                </div>
                                <div className='disabled-input'>
                                    {disabledValue}
                                </div>
                                <div className='d-flex align-items-center copy-buton'>
                                    <div className='align-items-center icon cursor-pointer'>
                                        <CopyToClipboard
                                            text={visiblePath2 + disabledValue}
                                        >
                                            <GoLink />
                                        </CopyToClipboard>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isPublished && (visiblePath1 !== 'https://techdoc.walkover.in/') && (
                            <div className="custom-input-wrapper d-flex align-items-center mt-4">
                                <div className='align-items-center editable-input cursor-pointer w-50' >
                                    <div className='d-flex align-items-center input'>
                                        <div className='value'>
                                            {visiblePath1}
                                        </div>
                                    </div>
                                </div>
                                <div className='disabled-input'>
                                    {disabledValue}
                                </div>
                                <div className='d-flex align-items-center copy-buton'>
                                    <div className='align-items-center icon cursor-pointer'>
                                        <CopyToClipboard
                                            text={visiblePath1 + disabledValue}
                                        >
                                            <GoLink />
                                        </CopyToClipboard>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    <div className='d-flex align-items-center mt-4 buttons'>
                        {!isPublished ? <Button className="w-100 publish-modal-btn cursor-pointer d-flex align-items-center" onClick={handlePublishClick}>
                            Publish
                        </Button> : <Button className="publish-modal-btn cursor-pointer d-flex align-items-center" onClick={handleUnpublishClick}  >
                            Unpublish
                        </Button>}
                        {isContentChanged && isPublished && <Button className="publish-modal-btn cursor-pointer d-flex align-items-center" onClick={handlePublishClick}>
                            Publish
                        </Button>}
                        {isPublished && <Button className="publish-modal-btn cursor-pointer d-flex align-items-center" onClick={handleViewSite} >
                            View Site
                        </Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PublishModal;
