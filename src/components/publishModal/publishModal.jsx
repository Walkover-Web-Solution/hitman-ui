import React, { useEffect, useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './publishModal.scss'
import { getUrlPathById, SESSION_STORAGE_KEY } from '../common/utility';
import { useSelector } from 'react-redux';
import { GoLink } from "react-icons/go";
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import TagInput from './tagInput';

function PublishModal({ onPublish, onUnpublish, id, collectionId, isContentChanged}) {

    const [disabledValue, setDisabledValue] = useState(null);
    const [save, setSave] = useState(true)
    const { pages, customDomain, isPublished } = useSelector((state) => ({
        pages: state.pages,
        customDomain: state.collections?.[collectionId]?.customDomain || '',
        isPublished: state?.pages[state.tabs.activeTabId]?.isPublished,
    }));

    useEffect(() => {
        sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId);
        let pathName = getUrlPathById(id, pages);
        setDisabledValue(`/${pathName}`);
        setSave(true)
    }, [collectionId, id, pages]);

    const visiblePath1 = `${process.env.NEXT_PUBLIC_UI_URL}/p`;

    const visiblePath2 = customDomain ? `https://${customDomain}` : null

    const handlePublishClick = () => {
        sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId)
        let pathName = getUrlPathById(id, pages)
        setDisabledValue(`/${pathName}`)
        onPublish()
    }

    const handlePublish = () => {
        setSave(false)
        onPublish()
    }

    const handleUnpublishClick = () => {
        setSave(true)
        onUnpublish()
    }

    const handleViewSite = () => {
        const path = `/p${disabledValue}`;
        window.open(path, '_blank');
    };


    const handleCopy = () => {
        toast.success('Link copied!');
    };

    const showTooltips = (tooltipType) => {
        switch (tooltipType) {
            case "path2":
                return (
                    <Tooltip className="custom-tooltip" id='link-tooltip'>
                        {
                            <div className="font-12 text-secondary">
                                <span>&nbsp;{visiblePath2 + disabledValue}</span>
                            </div>
                        }
                    </Tooltip>
                )
            case "path1":
                return (
                    <Tooltip className="custom-tooltip" id='link-tooltip'>
                        {
                            <div className="font-12 text-secondary">
                                <span>&nbsp;{visiblePath1 + disabledValue}</span>
                            </div>
                        }
                    </Tooltip>
                )
        }
    }

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
                ) : (customDomain &&
                    <div className="custom-input-wrapper mr-1 ml-1 mt-1 d-flex align-items-center border bg rounded">
                        <div className='align-items-center editable-input cursor-pointer w-50 p-1  border-right bg-white' >
                            <div className='d-flex align-items-center input'>
                                <div className='value overflow-auto font-14 text-grey'>
                                    {visiblePath2}
                                </div>
                            </div>
                        </div>
                        <div className='d-flex justify-content-between flex-grow-1 cursor-pointer'>
                            <OverlayTrigger placement='bottom' overlay={showTooltips("path2")} >
                                <div className='disabled-input overflow-auto p-1 pr-3 text-nowrap font-14 text-grey text'>
                                    {disabledValue}
                                </div>
                            </OverlayTrigger>
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
                {isPublished && (
                    <div className="custom-input-wrapper d-flex align-items-center mt-2 border bg rounded">
                        <div className='align-items-center editable-input cursor-pointer bg-white w-50 p-1 border-right' >
                            <div className='d-flex align-items-center input'>
                                <div className='value font-14 text-grey'>
                                    {visiblePath1}
                                </div>
                            </div>
                        </div>
                        <div className='d-flex justify-content-between cursor-pointer   flex-grow-1'>
                            <OverlayTrigger placement='bottom' overlay={showTooltips("path1")} >
                                <div className='disabled-input overflow-auto p-1 pr-3 text-nowrap font-14 text-grey text'>
                                    {disabledValue}
                                </div>
                            </OverlayTrigger>
                            <div className='d-flex align-items-center copy-buton'>
                                <div className='align-items-center icon cursor-pointer'>
                                    <CopyToClipboard
                                        text={visiblePath1 + disabledValue}
                                        onCopy={handleCopy}
                                    >
                                        <GoLink className='mx-2' size={14} />
                                    </CopyToClipboard>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
               {isPublished && <TagInput pageId={id}/> } 
            </div>
            <div className='d-flex align-items-center justify-content-end gap-2 mt-4 '>
                {!isPublished ? <Button className="cursor-pointer btn-sm font-12" onClick={handlePublishClick}>
                    Publish
                </Button> : <Button className="cursor-pointer d-flex align-items-center btn-sm font-12 view-site" onClick={handleUnpublishClick}  >
                    Unpublish
                </Button>}
                {isContentChanged && save && isPublished && <Button className="cursor-pointer d-flex align-items-center btn-sm font-12 view-site " onClick={handlePublish} >
                    Publish
                </Button>}
                {isPublished && <Button className="bg-primary cursor-pointer d-flex align-items-center btn-sm font-12 view-site" onClick={handleViewSite} >
                    View Site
                </Button>
                }
            </div>
        </div >
    );
}

export default PublishModal;