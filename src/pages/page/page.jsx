import React, { useCallback, useRef, useEffect, useState } from "react";
import { useParams } from "react-router";
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
import './page.scss';

const Page = () => {

    const { draftContent, page, pages, users, activeTabId, tabs, isPublished } = useSelector((state) => ({
        draftContent: state.tabs.tabs[state.tabs.activeTabId]?.draft,
        page: state?.pages[state.tabs.activeTabId],
        pages: state.pages,
        users: state.users,
        activeTabId: state.tabs.activeTabId,
        tabs: state.tabs.tabs,
        isPublished: state?.pages[state.tabs.activeTabId]?.isPublished
    }));

    const dispatch = useDispatch();
    const { pageId } = useParams();
    const textareaRef = useRef(null);

    const [sidebar, setSidebar] = useState(false);
    const [pageName, setPageName] = useState(page?.name);

    const updatedById = pages?.[pageId]?.updatedBy;
    const lastModified = pages?.[pageId]?.updatedAt ? moment(pages[pageId].updatedAt).fromNow() : null;
    const user = users?.usersList?.find((user) => user.id === updatedById);

    useEffect(() => {
        if (typeof window.SendDataToChatbot === 'function' && tabs[activeTabId]?.type === 'page') {
            window.SendDataToChatbot({
                bridgeName: 'page',
                threadId: `${users.currentUser.id}-${pageId}`,
                variables: { Proxy_auth_token: getProxyToken(), collectionId: page?.collectionId }
            })
        }
    }, []);

    useEffect(() => {
        if (draftContent === undefined && tabs[activeTabId]?.status !== 'NEW') dispatch(fetchTabContent(pageId));
    }, [pageId, draftContent]);

    useEffect(() => {
        if (textareaRef.current) autoGrow(textareaRef.current);
        if (tabs?.[activeTabId]?.status === "NEW") return setPageName(tabs[activeTabId]?.name || 'Untitled');
        setPageName(page?.name || 'Untitled');
    }, [page?.name, tabs?.activeTabId?.name, pageId])

    const handleSavePage = () => {
        if (tabs?.[activeTabId]?.status === "NEW") setSidebar(true);
        else dispatch(updatePageContent(page.id, draftContent, pageName));
    };

    useEffect(() => {
        const handleSaveKeydown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handleSavePage();
            }
        };
        window.addEventListener('keydown', handleSaveKeydown);
        return () => window.removeEventListener('keydown', handleSaveKeydown);
    }, [handleSavePage]);

    const debounceUpdateDraft = useCallback(
        debounce((activeTabId, content) => {
            dispatch(updateDraft(activeTabId, content));
        }, 500),
        []
    );

    const debounceUpdateName = useCallback(
        debounce((activeTabId, name) => {
            dispatch(updateNewTabName(activeTabId, name));
        }, 500),
        []
    );

    const handleContentChange = (newContent) => {
        if (tabs[activeTabId]?.isModified === false) dispatch(setTabIsModified(activeTabId, true));
        debounceUpdateDraft(activeTabId, newContent);
    };

    const handlePageNameChange = (event) => {
        const newName = event.target.value;
        setPageName(newName);
        if (tabs?.[activeTabId]?.status === "NEW") {
            debounceUpdateName(activeTabId, newName);
        }
    };

    const handleSavePageName = () => {
        if (tabs?.[activeTabId]?.status === "SAVED") dispatch(updatePageName(page.id, pageName));
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

    return (
        <div className='parent-page-container d-flex flex-column align-items-center w-100'>
            <div className='page-header position-sticky px-3 py-2 bg-white d-flex align-items-center justify-content-between w-100'>
                <h1 className="header-page-name fa-1x text-truncate w-25">{pageName?.length > 0 ? pageName : <span>Untitled</span>}</h1>
                <div className='header-operations d-flex align-items-center gap-2'>
                    {tabs?.[activeTabId]?.status !== "NEW" && <div>
                        <OverlayTrigger
                            placement='bottom'
                            overlay={
                                <Tooltip id='edited-by-tooltip'>
                                    {lastModified &&
                                        <div className="fs-4 text-secondary">
                                            <span>Edited by </span>
                                            <span className="font-weight-bold text-white">{user?.name}</span>
                                            <span>&nbsp;{lastModified}</span>
                                        </div>
                                    }
                                </Tooltip>
                            }
                        >
                            <button className='text-black-50 btn p-0'>Edited {lastModified}</button>
                        </OverlayTrigger>
                    </div>}
                    <IconButton>
                        <div className='button'>
                            <OverlayTrigger
                                placement='bottom'
                                overlay={
                                    <Tooltip id='edited-by-tooltip'>
                                        <div className="fs-4 text-secondary">{window.navigator.platform.toLowerCase().includes("mac") ? <span>cmd + s</span> : <span>ctrl + s</span>}</div>
                                    </Tooltip>
                                }
                            >
                                {tabs[activeTabId]?.isModified ? <button className="btn p-0" onClick={handleSavePage}>Save</button> : <button className="btn p-0 text-black-60 disabled">{tabs?.[activeTabId]?.status === "NEW" ? 'Unsaved' : "Saved"}</button>}
                            </OverlayTrigger>
                        </div>
                    </IconButton>
                    {tabs?.[activeTabId]?.status !== 'NEW' && <div className='inner-operations'>
                        <Dropdown>
                            <Dropdown.Toggle as='div' id='dropdown-basic'>
                                <IconButton className='mt-1'><BsThreeDots color="black" size={18} /></IconButton>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handlePublish} disabled={isPublished}>Publish</Dropdown.Item>
                                <Dropdown.Item className={`${!isPublished ? 'disable-unpublish' : 'unpublish-btn'}`} onClick={handleUnPublish} disabled={!isPublished}>Unpublish</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>}
                </div>
            </div>

            <div className='page-container h-100 w-100 p-3'>
                <textarea
                    ref={textareaRef}
                    onInput={() => autoGrow(textareaRef.current)}
                    className='page-name fa-3x font-weight-bold mt-5 border-0 w-100'
                    type='text'
                    value={pageName}
                    placeholder='Untitled'
                    onChange={handlePageNameChange}
                    onKeyDown={handlePageNameKeyDown}
                    onBlur={handleSavePageName}
                />
                <div id='tiptap-editor' className='page-content '>
                    <Tiptap
                        key={pageId}
                        onChange={handleContentChange}
                        initial={draftContent}
                        isInlineEditor={false}
                        disabled={false} />
                </div>
            </div>
            {sidebar && <SaveAsPageSidebar pageId={activeTabId} name={pageName} setName={setPageName} onHide={() => setSidebar(false)} handleSubmit={() => setSidebar(false)} />}
        </div>
    );
};

export default Page;