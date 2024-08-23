import React, { useCallback, useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchTabContent, setTabIsModified, updateDraft, updateNewTabName } from "../../components/tabs/redux/tabsActions";
import { approvePage, draftPage } from "../../components/publicEndpoint/redux/publicEndpointsActions";
import Tiptap from "../../components/tiptapEditor/tiptap";
import { debounce } from "lodash";
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsThreeDots } from 'react-icons/bs';
import moment from 'moment';
import { updatePageContent, updatePageName } from '../../components/pages/redux/pagesActions';
import SaveAsPageSidebar from '../../components/endpoints/saveAsSidebar1';
import IconButton from '../../components/common/iconButton';
import { getProxyToken } from "../../components/auth/authServiceV2";
import { GoDotFill } from "react-icons/go";
import { functionTypes } from "../../components/common/functionType";
import { getOrgId } from "../../components/common/utility";
import './page.scss'

const Page = () => {

    const { draftContent, page, pages, users, activeTabId, tabs, isPublished, collection } = useSelector((state) => ({
        draftContent: state.tabs.tabs[state.tabs.activeTabId]?.draft,
        page: state?.pages[state.tabs.activeTabId],
        collection: state.collection,
        pages: state.pages,
        users: state.users,
        activeTabId: state.tabs.activeTabId,
        tabs: state.tabs.tabs,
        isPublished: state?.pages[state.tabs.activeTabId]?.isPublished
    }));

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pageId } = useParams();
    const textareaRef = useRef(null);

    const [sidebar, setSidebar] = useState(false);
    const [pageName, setPageName] = useState(page?.name);

    const updatedById = pages?.[pageId]?.updatedBy;
    const createdAt = pages?.[pageId]?.createdAt ? moment(pages[pageId].updatedAt).fromNow() : null
    const lastModified = pages?.[pageId]?.updatedAt ? moment(pages[pageId].updatedAt).fromNow() : null;
    const user = users?.usersList?.find((user) => user.id === updatedById);

    useEffect(() => {
        if (typeof window.SendDataToChatbot === 'function' && tabs[activeTabId]?.type === 'page') {
            window.SendDataToChatbot({
                bridgeName: 'page',
                threadId: `${users.currentUser.id}-${pageId}`,
                variables: {
                    Proxy_auth_token: getProxyToken(),
                    collectionId: page?.collectionId,
                    functionType: process.env.REACT_APP_ENV === 'prod' ? functionTypes.prod : functionTypes.dev
                }
            })
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleSaveKeydown);
        if (draftContent === undefined && tabs[activeTabId]?.status === 'SAVED') dispatch(fetchTabContent(pageId));
        return () => window.removeEventListener('keydown', handleSaveKeydown);
    }, [pageId, draftContent]);

    useEffect(() => {
        if (textareaRef.current) autoGrow(textareaRef.current);
        if (tabs[activeTabId].status === "NEW") return setPageName(tabs[activeTabId]?.name || 'Untitled');
        setPageName(page?.name || 'Untitled');
    }, [page?.name, tabs?.activeTabId?.name, pageId])

    const handleSaveKeydown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            handleSavePage();
        }
    };

    const handleSavePage = () => {
        if (tabs[activeTabId]?.status === "NEW") setSidebar(true);
        else dispatch(updatePageContent(page.id, draftContent, pageName));
    };

    const debounceUpdateName = useCallback(
        debounce((activeTabId, name) => {
            dispatch(updateNewTabName(activeTabId, name));
        }, 500)
    );

    const handleContentChange = (newContent) => {
        if (tabs[activeTabId]?.isModified === false) dispatch(setTabIsModified(activeTabId, true));
        dispatch(updateDraft(activeTabId, newContent))
    };

    const handlePageNameChange = (event) => {
        const newName = event.target.value;
        setPageName(newName);
        if (tabs?.[activeTabId]?.status === "NEW") debounceUpdateName(activeTabId, newName);
    };

    const handleSavePageName = () => {
        if (tabs[activeTabId].status === "SAVED") dispatch(updatePageName(page.id, pageName));
    };

    const handlePageNameKeyDown = (event) => {
        if (event.key === 'Enter') {
            const editorInput = document.querySelector('#tiptap-editor [contenteditable="true"]');
            if (editorInput) editorInput.focus();
            handleSavePageName();
        }
    };

    const autoGrow = (element) => {
        element.style.height = '5px';
        element.style.height = `${element.scrollHeight}px`;
    };

    const handlePublish = async () => {
        dispatch(approvePage(pages[pageId]))
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
                            <div className="fs-4 text-secondary">
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
                return <Tooltip id='edited-by-tooltip' className="fs-4 text-secondary"><span className="live-tooltip">Live</span></Tooltip>
            case "shortcut":
                return (
                    <Tooltip id='edited-by-tooltip'>
                        <div className="fs-4 text-secondary">
                            {window.navigator.platform.toLowerCase().includes("mac") ? <span>cmd + s</span> : <span>ctrl + s</span>}
                        </div>
                    </Tooltip>
                )
        }
    }
    const orgId = getOrgId()

    const getPath = (id, sidebar) => {
        let path = []
        while (sidebar?.[id]?.type > 0) {
            const itemName = sidebar[id].name
            path.push({ name: itemName, path: `orgs/${orgId}/dashboard/page/${id}`, id: id })
            id = sidebar?.[id]?.parentId
        }
        return path.reverse()
    }

    const pathWithUrls = getPath(pageId, pages)

    const renderPathLinks = () => {
        return pathWithUrls.map((item, index) => {
            if (pages?.[item.id]?.type === 2) return null;
            return (
                <span style={{ cursor: 'pointer' }} key={index} onClick={() => navigate(`/${item.path}`, { replace: true })}  >
                    {item.name}
                    {index < pathWithUrls.length - 1 && '/'}
                </span>
            )
        })
    }
    // const collectionId = pages[pageId].collectionId
    // const collectionName = collection[collectionId].name
    // const path = `orgs/${orgId}/dashboard/collection/${collectionId}/settings`

    return (
        <div className='parent-page-container d-flex flex-column align-items-center w-100'>
            <div className='page-header position-sticky px-3 py-2 bg-white d-flex align-items-center justify-content-between w-100'>
                <div className="d-flex justify-content-start align-items-center w-50">
                    {/* {collectionName && <span className='collection-name-path'
                        onClick={() => navigate(`/${path}`, { replace: true })}
                        style={{ cursor: 'pointer' }}>{`${collectionName}/`}</span>} */}
                    {<h1 className="header-page-name fa-1x text-truncate">{pageName?.length > 0 ?
                        renderPathLinks()
                        : <span>Untitled</span>}</h1>}
                    {pages?.[pageId]?.isPublished &&
                        <OverlayTrigger placement='right' overlay={showTooltips("Live")} >
                            <GoDotFill size={14} color="green" />
                        </OverlayTrigger>
                    }
                </div>
                <div className='header-operations d-flex align-items-center gap-2'>
                    {tabs?.[activeTabId]?.status !== "NEW" &&
                        <div>
                            <OverlayTrigger placement='bottom' overlay={showTooltips("EditedBy")}>
                                <button className='text-black-50 btn p-0'>Edited {lastModified}</button>
                            </OverlayTrigger>
                        </div>
                    }
                    <IconButton>
                        <div className='button'>
                            <OverlayTrigger placement='bottom' overlay={showTooltips("shortcut")}>
                                {tabs[activeTabId]?.isModified ? <button className="btn p-0" onClick={handleSavePage}>Save</button> : <button className="btn p-0 text-black-60 disabled">{tabs?.[activeTabId]?.status === "NEW" ? 'Unsaved' : "Saved"}</button>}
                            </OverlayTrigger>
                        </div>
                    </IconButton>
                    {tabs?.[activeTabId]?.status !== 'NEW' && <div className='inner-operations'>
                        <Dropdown>
                            <Dropdown.Toggle as='div' id='dropdown-basic'>
                                <IconButton variant="sm" className='mt-1'><BsThreeDots size={25} /></IconButton>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handlePublish} disabled={isPublished}>Publish</Dropdown.Item>
                                <Dropdown.Item onClick={handleUnPublish} disabled={!isPublished}>Unpublish</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>}
                </div>
            </div>

            <div className='page-container h-100 w-100 p-3'>
                <textarea
                    ref={textareaRef}
                    onInput={() => autoGrow(textareaRef.current)}
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
                        onChange={handleContentChange}
                        initial={draftContent}
                        isInlineEditor={false}
                        disabled={false}
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