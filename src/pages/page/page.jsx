"use client"
import React, { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTabIsModified, updateDraft, updateNewTabName } from "../../components/tabs/redux/tabsActions";
import { approvePage, draftPage } from "../../components/publicEndpoint/redux/publicEndpointsActions";
import Tiptap from "../../components/tiptapEditor/tiptap";
import { debounce } from "lodash";
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsCommand, BsThreeDots } from 'react-icons/bs';
import moment from 'moment';
import { updatePageName } from '../../components/pages/redux/pagesActions';
import SaveAsPageSidebar from '../../components/endpoints/saveAsSidebar1';
import IconButton from '../../components/common/iconButton';
import { getProxyToken } from "../../components/auth/authServiceV2";
import { GoDotFill } from "react-icons/go";
import { functionTypes } from "../../components/common/functionType";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import './page.scss'
import { getOrgId, msgText } from "../../components/common/utility";
import ConfirmationModal from "../../components/common/confirmationModal";
import { useRouter,useParams } from "next/navigation";
import { navigateTo } from "src/navigationService";
import { setPagesPath } from "../../components/pages/redux/pagesActions";


const Page = () => {

    const { draftContent, page, pages, users, activeTabId, tabs, collections, isPublished } = useSelector((state) => ({
        draftContent: state.tabs.tabs[state.tabs.activeTabId]?.draft,
        page: state?.pages[state.tabs.activeTabId],
        pages: state.pages,
        users: state.users,
        activeTabId: state.tabs.activeTabId,
        tabs: state.tabs.tabs,
        collections: state.collections,
    }));
    const router = useRouter();

    const dispatch = useDispatch();
    const textareaRef = useRef(null);
    const params = useParams()
    const{orgId, pageId} = params
    const [sidebar, setSidebar] = useState(false);
    const [pageName, setPageName] = useState(page?.name);
    const [openPublishConfirmationModal, setOpenPublishConfirmationModal] = useState(false);
    const [openUnpublishConfirmationModal, setOpenUnpublishConfirmationModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const updatedById = pages?.[pageId]?.updatedBy;
    const createdAt = pages?.[pageId]?.createdAt ? moment(pages[pageId].updatedAt).fromNow() : null
    const lastModified = pages?.[pageId]?.updatedAt ? moment(pages[pageId].updatedAt).fromNow() : null;
    const user = users?.usersList?.find((user) => user.id === updatedById);
    const [pathData,setPathData] = useState('');

    useEffect(() => {
        if (typeof window.SendDataToChatbot === 'function' && tabs[activeTabId]?.type === 'page') {
            window.SendDataToChatbot({
                bridgeName: 'page',
                threadId: `${users.currentUser.id}-${pageId}`,
                variables: {
                    Proxy_auth_token: getProxyToken(),
                    collectionId: page?.collectionId,
                    functionType: process.env.NEXT_PUBLIC_ENV === 'prod' ? functionTypes.prod : functionTypes.dev
                }
            })
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleSaveKeydown);

        return () => window.removeEventListener('keydown', handleSaveKeydown);
    }, [pageId]);

    useEffect(() => {
        if (textareaRef.current) autoGrow(textareaRef.current);
        if (tabs[activeTabId].status === "NEW") return setPageName(tabs[activeTabId]?.name || 'Untitled');
        setPageName(page?.name || 'Untitled');
    }, [page?.name, tabs?.activeTabId?.name, pageId])

    const mapping = {
        local: process.env.NEXT_PUBLIC_RTC_URL_LOCAL,
        test: process.env.NEXT_PUBLIC_RTC_URL_TEST,
        prod: process.env.NEXT_PUBLIC_RTC_URL_PROD,
    };

    const { ydoc, provider } = useMemo(() => {
        
        if (tabs[activeTabId].status !== "SAVED") return { ydoc: null, provider: null };
        const ydoc = new Y.Doc();
        const baseUrl = mapping[process.env.NEXT_PUBLIC_ENV];
        const provider = new HocuspocusProvider({
            url: `${baseUrl}?orgId=${orgId}`,
            name: `${pageId}`,
            document: ydoc,
        });
        return { ydoc, provider };
    }, [orgId, pageId,tabs[activeTabId]]);

    // useEffect(() => {
    //     return () => {
    //         if (provider) provider.destroy();
    //         if (ydoc) ydoc.destroy();
    //     };
    // }, [provider, ydoc, pageId]);

    const handleSaveKeydown = (event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            handleSavePage();
        }
        if ((isMac && event.metaKey && event.key === "m") || (!isMac && event.ctrlKey && event.key === "m") && tabs[activeTabId]?.status !== "NEW") {
            event.preventDefault();
            publishClick();
        }
        if ((isMac && event.metaKey && event.key === "q") || (!isMac && event.ctrlKey && event.key === "q") && tabs[activeTabId]?.status !== "NEW") {
            event.preventDefault();
            unpublishClick();
        }
    };

    const handleSavePage = () => {
        if (tabs[activeTabId]?.status === "NEW") setSidebar(true);
    };

    const debounceUpdateName = useCallback(
        debounce((activeTabId, name) => {
            dispatch(updateNewTabName(activeTabId, name));
        }, 500)
    );

    const handlePageNameChange = (event) => {
        const newName = event.target.value;
        if (newName !== pageName) {
            setPageName(newName);
            if (tabs?.[activeTabId]?.status === "NEW") debounceUpdateName(activeTabId, newName);
        }
    };

    const handleSavePageName = () => {
        if (tabs[activeTabId].status === "SAVED" && pageName !== page?.name) {
            dispatch(updatePageName(page.id, pageName));
        }
    };

    const handlePageNameKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
            handleSavePageName();
        }
    };

    const autoGrow = (element) => {

        element.style.height = '5px';
        element.style.height = `${element.scrollHeight}px`;
        setPageName(element.textContent)
    };

    const handleContentChange = (newContent) => {
        if (tabs[activeTabId]?.isModified === false) dispatch(setTabIsModified(activeTabId, true));
        dispatch(updateDraft(activeTabId, newContent))
    };
    const publishClick = () => {
            setOpenPublishConfirmationModal(true)
    }

    const unpublishClick = () => {
        if (page?.isPublished) {
            setOpenUnpublishConfirmationModal(true)
        }
    }

    const renderPublishConfirmationModal = () => {
        return (
            openPublishConfirmationModal && (
                <ConfirmationModal
                    show={openPublishConfirmationModal}
                    onHide={() => setOpenPublishConfirmationModal(false)}
                    proceed_button_callback={handlePublish}
                    title={msgText.publishPage}
                    submitButton='Publish'
                    rejectButton='Discard'
                />
            )
        )
    }

    const renderUnPublishConfirmationModal = () => {
        return (
            openUnpublishConfirmationModal && (
                <ConfirmationModal
                    show={openUnpublishConfirmationModal}
                    onHide={() => setOpenUnpublishConfirmationModal(false)}
                    proceed_button_callback={handleUnPublish}
                    title={msgText.unpublishPage}
                    submitButton='UnPublish'
                    rejectButton='Discard'
                />
            )
        )
    }

    const handlePublish = async () => {
        setLoading(true)
        await dispatch(approvePage(pages[pageId]))
        setLoading(false)
    };

    const handleUnPublish = async () => {
        page.isPublished = false;
        page.publishedEndpoint = {};
        page.state = 1;
        dispatch(draftPage(page))
    };

    const showTooltips = (tooltipType) => {
        switch (tooltipType) {
            case "EditedBy":
                return (
                    <Tooltip id='edited-by-tooltip'>
                        {lastModified &&
                            <div className="font-12 text-secondary">
                                <div>
                                    <span>Edited by </span>
                                    <span className="font-weight-bold text-white">{user?.name}</span>
                                    <span>&nbsp;{lastModified}</span>
                                </div>
                                <div>
                                    <span>Created by </span>
                                    <span className="font-weight-bold text-white">{user?.name}</span>
                                    <span>&nbsp;{createdAt}</span>
                                </div>
                            </div>
                        }
                    </Tooltip>
                )
            case "Live":
                return <Tooltip id='edited-by-tooltip' className="font-12 text-secondary live-tooltip">Live</Tooltip>
            case "shortcut":
                return (
                    <Tooltip id='edited-by-tooltip'>
                        <div className="font-12 text-secondary">
                            {window.navigator.platform.toLowerCase().includes("mac") ? <span>cmd + s</span> : <span>ctrl + s</span>}
                        </div>
                    </Tooltip>
                )
        }
    }

    const getPath = (id, sidebar) => {
        const orgId = getOrgId();
        let path = [];
        let newPath = `${pages?.[activeTabId]?.collectionId}`;
        let pagePath = [];

        while (sidebar?.[id]?.type > 0) {
            const itemName = sidebar[id].name;
            path.push({ name: itemName, path: `orgs/${orgId}/dashboard/page/${id}`, id: id });
            id = sidebar?.[id]?.parentId;
        }
        path.forEach((item) => {
            if (pages?.[item.id]?.type !== 2) {
                pagePath.push(`/${item.id}`);
            }
        });
        pagePath = pagePath.reverse().join('');
        newPath = newPath + pagePath;
        return { pathArray: path.reverse(), newPath };
    };
    useEffect(() => {
        const { newPath } = getPath(activeTabId, pages);
        setPathData(newPath);  
        setPagesPath(newPath);
    }, [activeTabId, pages]); 

    const handleStrongChange = (e) => {
        setPageName(e.currentTarget.textContent);
    };


    const renderPathLinks = () => {
        const { pathArray } = getPath(pageId, pages);
        const pathWithUrls = pathArray
        return pathWithUrls.map((item, index) => {
            if (pages?.[item.id]?.type === 2) return null;
            const isLastItem = index === pathWithUrls.length - 1;
            return (
                <div className='d-flex align-items-center' key={index} onClick={() => router.push(`/${item.path}`)}>
                    {isLastItem ? (
                        <strong
                            className="fw-500 py-0 px-1 cursor-text"
                            onInput={handleStrongChange}
                            onChange={handlePageNameChange}
                            onKeyDown={handlePageNameKeyDown}
                            onBlur={handleSavePageName}
                            contentEditable
                            key={index}
                        >
                            {item.name}
                        </strong>
                    ) : (
                        <strong className='cursor-pointer fw-400 px-1 py-0 text-secondary'>{item?.name}</strong>
                    )}
                    {index < pathWithUrls.length - 1 && <p className='p-0 m-0 text-secondary fw-400'>/</p>}
                </div>
            );
        });
    };

    const handleCollectionClick = () => {
        const path = `orgs/${getOrgId()}/dashboard/collection/${pages?.[activeTabId]?.collectionId}/settings`;
        router.push(`/${path}`, { replace: true });
    }

    return (
        <div className='parent-page-container d-flex flex-column align-items-center w-100'>
            <div className='page-header position-sticky px-3 py-3 bg-white d-flex align-items-center justify-content-between w-100'>
                <div className="d-flex justify-content-start align-items-center">
                    {tabs?.[activeTabId]?.status === 'SAVED' &&
                        <div className="header-page-name d-flex align-items-center fa-1x text-truncate">
                            <strong className='text-secondary fw-400 px-1 py-0 text-nowrap-heading cursor-pointer' onClick={handleCollectionClick}>
                                {collections?.[pages?.[activeTabId]?.collectionId]?.name}
                            </strong>
                            <p className='p-0 m-0 text-secondary fw-400'>/</p>
                        </div>
                    }
                    <div className="header-page-name d-flex align-items-center fa-1x">
                        {renderPathLinks()}
                    </div>
                    {
                        loading && <div>
                            <div class="spinner-border spinner-border-sm ml-2 publish-spinner" role="status">
                                <span class="sr-only ">Publishing...</span>
                            </div>
                            <span className="ml-1 publish-loader">Publishing...</span>
                        </div>
                    }
                    {pages?.[pageId]?.isPublished && !loading &&
                        <OverlayTrigger placement='right' overlay={showTooltips("Live")} >
                            <GoDotFill size={14} color="green" />
                        </OverlayTrigger>
                    }
                </div>
                <div className='header-operations d-flex align-items-center gap-2'>
                    {tabs?.[activeTabId]?.status !== "NEW" &&
                        <OverlayTrigger placement='bottom' overlay={showTooltips("EditedBy")}>
                            <button className='text-black-50 btn p-0'>Edited {lastModified}</button>
                        </OverlayTrigger>
                    }
                    <IconButton>
                        <div className='button'>
                            <OverlayTrigger placement='bottom' overlay={showTooltips("shortcut")}>
                                {tabs[activeTabId]?.isModified ? <button className="btn p-0" onClick={handleSavePage}>Save</button> : <button className="btn p-0 text-black-60 disabled">{tabs[activeTabId]?.status === "NEW" ? (
                                    <button className="btn p-0 text-black-60 disabled">
                                        Unsaved
                                    </button>
                                ) : (
                                    <></>
                                )}</button>}
                            </OverlayTrigger>
                        </div>
                    </IconButton>
                    {tabs?.[activeTabId]?.status !== 'NEW' &&
                        <div className='inner-operations'>
                            <Dropdown>
                                <Dropdown.Toggle as='div' id='dropdown-basic'>
                                    <IconButton variant="sm"><BsThreeDots className="text-grey" size={25} /></IconButton>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="p-1 font-12 px-2 d-flex justify-content-between align-items-center " onClick={publishClick}>
                                        <span>Publish</span>
                                        <span className="text-black-50" >{window.navigator.platform.toLowerCase().includes("mac") ? <><BsCommand size={11} className='cmd-icons' />+ <span className='font-12 d-inline-block'>M</span></> : <span className="font-10">Ctrl + M</span>}</span>
                                    </Dropdown.Item>
                                    {pages?.[pageId]?.isPublished && <Dropdown.Item
                                        onClick={unpublishClick}
                                        className="p-1 px-2 font-12 d-flex justify-content-between align-items-center unpublish-page "
                                    >
                                        <span className="text-danger">Unpublish</span>
                                        <span className="text-black-50">{window.navigator.platform.toLowerCase().includes("mac") ? <><BsCommand size={11} className='cmd-icons' />+ <span className='font-12 d-inline-block'>Q</span></> : <span className="font-10">Ctrl + Q</span>}</span>
                                    </Dropdown.Item>}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    }
                    {renderPublishConfirmationModal()}
                    {renderUnPublishConfirmationModal()}
                </div>
            </div>

            <div className='page-container h-100 w-100 p-3'>
                <textarea
                    ref={textareaRef}
                    onInput={(e) => {
                        setPageName(e.target.value)
                        autoGrow(textareaRef.current)
                    }}
                    className='page-name text-black fa-3x font-weight-bold mt-5 border-0 w-100'
                    type='text'
                    value={pageName}
                    placeholder='Untitled'
                    onChange={handlePageNameChange}
                    onKeyDown={handlePageNameKeyDown}
                    onBlur={handleSavePageName}
                />
                <div id='tiptap-editor' className='page-content '>
                    <Tiptap
                        provider={provider}
                        ydoc={ydoc}
                        isInlineEditor={false}
                        disabled={false}
                        initial={draftContent || false}
                        onChange={handleContentChange || false}
                        isEndpoint={tabs[activeTabId]?.status === 'NEW' ? true : false}
                        key={activeTabId}
                        pathData={pathData}
                    />
                </div>
            </div>
            {sidebar &&
                <SaveAsPageSidebar
                    pageId={activeTabId}
                    name={pageName}
                    setName={setPageName}
                    onHide={() => setSidebar(false)}
                    handleSubmit={() => setSidebar(false)}
                />
            }
        </div>
    );
};

export default Page;