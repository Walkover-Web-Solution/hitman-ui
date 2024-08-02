import React, { useCallback, useRef, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchTabContent, setTabIsModified, updateDraft, updateNewTabName } from "../../components/tabs/redux/tabsActions";
import { approvePage, draftPage } from "../../components/publicEndpoint/publicPageService";
import Tiptap from "../../components/tiptapEditor/tiptap";
import { debounce } from "lodash";
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsThreeDots } from 'react-icons/bs';
import moment from 'moment';
import { updatePageContent, updatePageName } from '../../components/pages/redux/pagesActions';
import SaveAsPageSidebar from '../../components/endpoints/saveAsSidebar1';
import IconButton from '../../components/common/iconButton';
import './page.scss';

const Page = () => {
    const dispatch = useDispatch();
    const { pageId } = useParams();
    const params = useParams();
    const textareaRef = useRef(null);

    const [editorKey, setEditorKey] = useState(0);
    const [sidebar, setSidebar] = useState(false);
    const [isPublish, setIsPublish] = useState(false);

    const { draftContent, page, pages, users, activeTabId, tabs } = useSelector((state) => ({
        draftContent: state.tabs.tabs[state.tabs.activeTabId]?.draft,
        page: state?.pages[pageId],
        pages: state.pages,
        users: state.users.usersList,
        activeTabId: state.tabs.activeTabId,
        tabs: state.tabs.tabs
    }));

    const [pageName, setPageName] = useState(page?.name);
    const updatedById = pages?.[pageId]?.updatedBy;
    const lastModified = pages?.[pageId]?.updatedAt ? moment(pages[pageId].updatedAt).fromNow() : null;
    const user = users?.find((user) => user.id === updatedById);

    useEffect(() => {
        if (textareaRef.current) {
            autoGrow(textareaRef.current);
        }
        if (draftContent === undefined && tabs[activeTabId]?.status !== 'NEW') {
            dispatch(fetchTabContent(pageId));
        }
        setPageName(page?.name || 'Untitled');
        if (tabs[activeTabId].status === "SAVED") setPageName(page?.name);
        else if (tabs[activeTabId].status === "NEW") setPageName(tabs[activeTabId]?.name || 'Untitled');

        setIsPublish(pages[pageId]?.isPublished);

        setTimeout(() => {
            setEditorKey((prevKey) => prevKey + 1);
        }, 1000);
    }, [pageId, activeTabId, draftContent, page, tabs, dispatch, pages]);

    const handleSavePage = () => {
        if (tabs[activeTabId]?.status === "NEW") setSidebar(true);
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
        return () => {
            window.removeEventListener('keydown', handleSaveKeydown);
        };
    }, [handleSavePage]);

    const debounceUpdateDraft = useCallback(
        debounce((activeTabId, content) => {
            dispatch(updateDraft(activeTabId, content));
        }, 500),
        [dispatch]
    );

    const debounceUpdateName = useCallback(
        debounce((activeTabId, name) => {
            dispatch(updateNewTabName(activeTabId, name));
        }, 500),
        [dispatch]
    );

    const handleContentChange = (newContent) => {
        if (tabs[activeTabId]?.isModified === false) dispatch(setTabIsModified(activeTabId, true));
        debounceUpdateDraft(activeTabId, newContent);
    };

    const handlePageNameChange = (event) => {
        const newName = event.target.value;
        setPageName(newName);
        if (tabs[activeTabId].status === "NEW") {
            debounceUpdateName(activeTabId, newName);
        }
    };

    const handleSavePageName = () => {
        if (tabs[activeTabId].status === "SAVED") dispatch(updatePageName(page.id, pageName));
    };

    const handlePageNameKeyDown = (event) => {
        if (event.key === 'Enter') {
            const editorInput = document.querySelector('#tiptap-editor [contenteditable="true"]');
            if (editorInput) {
                editorInput.focus();
            }
            handleSavePageName();
        }
    };

    const autoGrow = (element) => {
        element.style.height = '5px';
        element.style.height = `${element.scrollHeight}px`;
    };

    const handlePublish = async () => {
        const pageId = params?.pageId;
        try {
            await approvePage(pages[pageId]);
            setIsPublish(true);
        } catch (error) {
            console.error('Error during approve_page:', error);
        }
    };

    const handleRemovePublicPage = useCallback((page) => {
        page.isPublished = false;
        page.publishedEndpoint = {};
        page.state = 1;
        page.position = null;
        draftPage(page);
    }, []);

    const handleUnPublish = async () => {
        const pageId = params?.pageId;
        try {
            handleRemovePublicPage(pages[pageId]);
            setIsPublish(false);
        } catch (error) {
            console.error('Error during draft_page:', error);
        }
    };

    return (
        <div className='parent-page-container d-flex flex-column align-items-center w-100'>
            <div className='page-header position-sticky px-3 py-2 bg-white d-flex align-items-center justify-content-between w-100'>
                <h1 className="header-page-name fa-1x text-truncate w-25">{pageName}</h1>
                <div className='header-operations d-flex align-items-center gap-2'>
                    <div>
                        <OverlayTrigger
                            placement='bottom'
                            overlay={
                                <Tooltip id='edited-by-tooltip'>
                                    <div>
                                        {lastModified ? (
                                            <div className="fs-4 text-secondary">
                                                <span>Updated by </span>
                                                <span className="font-weight-bold text-white">{user?.name}</span>
                                                <br />
                                                <span>Modified At </span>
                                                <span>{lastModified}</span>
                                            </div>
                                        ) : (
                                            <span>No Data</span>
                                        )}
                                    </div>
                                </Tooltip>
                            }
                        >
                            <button className='text-black-50 btn p-0'>Edited By</button>
                        </OverlayTrigger>
                    </div>
                    <IconButton>
                        <div className='button'>
                            <OverlayTrigger
                                placement='bottom'
                                overlay={
                                    <Tooltip id='edited-by-tooltip'>
                                        <div className="fs-4 font-weight-bold">
                                            {window.navigator.platform.toLowerCase().includes("mac") ? (
                                                <span>Cmd + S</span>
                                            ) : (
                                                <span>Ctrl + S</span>
                                            )}
                                        </div>
                                    </Tooltip>
                                }
                            >
                                {tabs[activeTabId]?.isModified ? (
                                    <button className="btn p-0" onClick={handleSavePage} >Save &nbsp;</button>
                                ) : (
                                    <button className="btn p-0 text-black-60 disabled" >Saved</button>
                                )}
                            </OverlayTrigger>
                        </div>
                    </IconButton>
                    <div className='inner-operations'>
                        <Dropdown>
                            <Dropdown.Toggle as='div' id='dropdown-basic'>
                                <div className='mt-1'>
                                    <IconButton><BsThreeDots color="black" size={18} /></IconButton>
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handlePublish} disabled={isPublish}>Publish</Dropdown.Item>
                                <Dropdown.Item className="unpublish-btn" onClick={handleUnPublish} disabled={!isPublish}>Unpublish</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div >
            </div >
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
                        key={`${pageId}-${editorKey}`}
                        onChange={handleContentChange}
                        initial={draftContent}
                        isInlineEditor={false}
                        disabled={false}
                    />
                </div>
            </div>
            {sidebar && <SaveAsPageSidebar pageId={activeTabId} name={pageName} setName={setPageName} onHide={() => setSidebar(false)} handleSubmit={() => setSidebar(false)} />}
        </div>
    );
};

export default Page;
