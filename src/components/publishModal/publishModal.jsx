import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import './publishModal.scss'
import { useNavigate, useParams } from 'react-router';
import { getUrlPathById, SESSION_STORAGE_KEY } from '../common/utility';
import { useSelector } from 'react-redux';
import { GoLink } from "react-icons/go";
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';

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

    const handleCopy = () => {
        toast.success('Link copied!');
    };

    return (
        <div className='custom-modal d-flex flex-column align-items-center'>
                    <div >
                        {!isPublished ? (
                            <div className='d-flex align-items-center flex-column text-container'>
                                <div className='fw-600 font-18'>
                                    Publish to Web
                                </div>
                                <div className='create d-flex align-items-center pb-4 font-12 text-grey'> Create a website with Techdoc </div>
                            </div>
                        ) : (
                            <div className="custom-input-wrapper d-flex align-items-center border bg rounded">
                                <div className='align-items-center editable-input cursor-pointer w-50 p-1  border-right bg-white' >
                                    <div className='d-flex align-items-center input'>
                                        <div className='value overflow-auto font-14 text-grey'>
                                            {visiblePath2}
                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between flex-grow-1'>
                                <div className='disabled-input overflow-auto p-1 pr-3 text-nowrap font-14 text-grey'>
                                    {disabledValue}
                                </div>
                                <div className='d-flex align-items-center copy-buton'>
                                    <div className='align-items-center icon cursor-pointer'>
                                        <CopyToClipboard
                                            text={visiblePath2 + disabledValue}
                                            onCopy={handleCopy}
                                        >
                                            <GoLink className='mx-2' size={14} />
                                        </CopyToClipboard>
                                    </div>
                                </div>
                                </div>
                            </div>
                        )}
                        {isPublished && (visiblePath1 !== 'https://techdoc.walkover.in/') && (
                            <div className="custom-input-wrapper d-flex align-items-center mt-2 border bg rounded">
                                <div className='align-items-center editable-input cursor-pointer bg-white w-50 p-1 border-right' >
                                    <div className='d-flex align-items-center input'>
                                        <div className='value font-14 text-grey'>
                                            {visiblePath1}
                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-between flex-grow-1'>
                                <div className='disabled-input overflow-auto p-1 pr-3 text-nowrap font-14 text-grey'>
                                    {disabledValue}
                                </div>
                                <div className='d-flex align-items-center copy-buton'>
                                    <div className='align-items-center icon cursor-pointer'>
                                        <CopyToClipboard
                                            text={visiblePath1 + disabledValue}
                                        >
                                          <GoLink className='mx-2' size={14} />
                                        </CopyToClipboard>
                                    </div>
                                </div>
                                </div>
                            </div>
                        )}

                    </div>
                    <div className='d-flex align-items-center justify-content-end gap-2 mt-4 buttons'>
                        {!isPublished ? <Button className="publish-modal-btn cursor-pointer btn-sm font-12" onClick={handlePublishClick}>
                            Publish
                        </Button> : <Button className="publish-modal-btn cursor-pointer d-flex align-items-center btn-sm font-12" onClick={handleUnpublishClick}  >
                            Unpublish
                        </Button>}
                        {isContentChanged && !isPublished && <Button className="publish-modal-btn cursor-pointer d-flex align-items-center btn-sm font-12" onClick={handlePublishClick}>
                            Publish
                        </Button>}
                        {isPublished && <Button className="publish-modal-btn cursor-pointer d-flex align-items-center btn-sm font-12" onClick={handleViewSite} >
                            View Site
                        </Button>
                        }
                    </div>
        </div>
    );
}

export default PublishModal;
