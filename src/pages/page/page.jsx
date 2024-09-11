import React, { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updateNewTabName } from "../../components/tabs/redux/tabsActions";
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

const Page = () => {

    const { draftContent, page, pages, users, activeTabId, tabs, collections, isPublished } = useSelector((state) => ({
        draftContent: state.tabs.tabs[state.tabs.activeTabId]?.draft,
        page: state?.pages[state.tabs.activeTabId],
        pages: state.pages,
        users: state.users,
        activeTabId: state.tabs.activeTabId,
        tabs: state.tabs.tabs,
        isPublished: state?.pages[state.tabs.activeTabId]?.isPublished,
        collections: state.collections
    }));

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pageId, orgId } = useParams();
    const textareaRef = useRef(null);

    const [sidebar, setSidebar] = useState(false);
    const [pageName, setPageName] = useState(page?.name);
    const [openPublishConfirmationModal, setOpenPublishConfirmationModal] = useState(false);
    const [openUnpublishConfirmationModal, setOpenUnpublishConfirmationModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [published, setPublished] = useState(false);

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
                    functionType: import.meta.env.VITE_ENV === 'prod' ? functionTypes.prod : functionTypes.dev
                }
            })
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleSaveKeydown);

        return () => {
            window.removeEventListener('keydown', handleSaveKeydown);
        }
    }, [pageId]);

    useEffect(() => {
        if (textareaRef.current) autoGrow(textareaRef.current);
        if (tabs[activeTabId].status === "NEW") return setPageName(tabs[activeTabId]?.name || 'Untitled');
        setPageName(page?.name || 'Untitled');
    }, [page?.name, tabs?.activeTabId?.name, pageId])

    const mapping = {
        local: import.meta.env.VITE_RTC_URL_LOCAL,
        test: import.meta.env.VITE_RTC_URL_TEST,
        prod: import.meta.env.VITE_RTC_URL_PROD,
    };

    const { ydoc, provider } = useMemo(() => {
        const ydoc = new Y.Doc();
        const baseUrl = mapping[import.meta.env.VITE_ENV];
        const provider = new HocuspocusProvider({
            url: `${baseUrl}?orgId=${orgId}`,
            name: `${pageId}`,
            document: ydoc,
        });
        return { ydoc, provider };
    }, [orgId, pageId]);

    useEffect(() => {
        return () => {
            provider.destroy();
            ydoc.destroy();
        };
    }, [provider, ydoc, pageId]);

    const handleSaveKeydown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            handleSavePage();
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
            event.preventDefault();
            publishClick();
        }
        if (event.ctrlKey && event.key === 'u') {
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
        setPageName(newName);
        if (tabs?.[activeTabId]?.status === "NEW") debounceUpdateName(activeTabId, newName);
    };

    const handleSavePageName = () => {
        if (tabs[activeTabId].status === "SAVED") dispatch(updatePageName(page.id, pageName));
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

    const publishClick = () => {
        setOpenPublishConfirmationModal(true)
    }

    const unpublishClick = () => {
        setOpenUnpublishConfirmationModal(true)
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
        setLoading(true);
        setPublished(false);

        setTimeout(() => {
            setLoading(false);
            setPublished(true);
        }, 2000);
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
                return <Tooltip id='edited-by-tooltip' className="fs-4 text-secondary live-tooltip">Live</Tooltip>
            case "shortcut":
                return (
                    <Tooltip id='edited-by-tooltip'>
                        <div className="fs-4 text-secondary">
                            {window.navigator.platform.toLowerCase().includes("mac") ? <span>CMD + S</span> : <span>CTRL + S</span>}
                        </div>
                    </Tooltip>
                )
        }
    }

    const getPath = (id, sidebar) => {
        const orgId = getOrgId()
        let path = []
        while (sidebar?.[id]?.type > 0) {
            const itemName = sidebar[id].name
            path.push({ name: itemName, path: `orgs/${orgId}/dashboard/page/${id}`, id: id })
            id = sidebar?.[id]?.parentId
        }
        return path.reverse()
    }

    const handleStrongChange = (e) => {
        setPageName(e.currentTarget.textContent);
    };


    const renderPathLinks = () => {
        const pathWithUrls = getPath(pageId, pages)
        return pathWithUrls.map((item, index) => {
            if (pages?.[item.id]?.type === 2) return null;
            const isLastItem = index === pathWithUrls.length - 1;
            return (
                <div className='d-flex align-items-center' key={index} onClick={() => navigate(`/${item.path}`, { replace: true })}>
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
        navigate(`/${path}`, { replace: true });
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
                    <div className="header-page-name d-flex align-items-center fa-1x text-truncate">
                        {renderPathLinks()}
                    </div>
                    {
                        loading &&
                            <div>
                                <div class="spinner-border spinner-border-sm ml-2" role="status"  style={{ color: '#6c757d ', width: '1rem', height: '1rem'  }}>
                                    <span class="sr-only ">Publishing...</span>
                                </div>
                                <span className="ml-1" style={{ color: '#6c757d ', fontSize: '0.8rem' }}>Publishing...</span>
                            </div>
                    }
                    {pages?.[pageId]?.isPublished && !loading &&
                        <div className="">
                            <OverlayTrigger placement='right' overlay={showTooltips("Live")} >
                            <GoDotFill size={14} color="green" />
                        </OverlayTrigger>
                        </div>
                    }
                </div>
                <div className='header-operations d-flex align-items-center gap-2'>
                    {tabs?.[activeTabId]?.status !== "NEW" &&
                        <OverlayTrigger placement='bottom' overlay={showTooltips("EditedBy")}>
                            <button className='text-black-50 btn p-0'>Edited {lastModified}</button>
                        </OverlayTrigger>
                    }
                    {tabs[activeTabId]?.status === "NEW" && <IconButton>
                        <button className="btn p-0 text-black-60 disabled">
                            Unsaved
                        </button>
                    </IconButton>}
                    {tabs?.[activeTabId]?.status !== 'NEW' &&
                        <div className='inner-operations'>
                            <Dropdown>
                                <Dropdown.Toggle as='div' id='dropdown-basic'>
                                    <IconButton variant="sm"><BsThreeDots className="text-grey" size={25} /></IconButton>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="p-1 d-flex justify-content-between align-items-center " onClick={publishClick}>
                                        <span>Publish</span>
                                        <span className="text-grey" >{window.navigator.platform.toLowerCase().includes("mac") ? <><BsCommand /> + B</>  : <span>Ctrl + B</span>}</span>
                                    </Dropdown.Item>
                                    {isPublished && <Dropdown.Item
                                        onClick={unpublishClick}
                                        className="p-1 d-flex justify-content-between align-items-center"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                        style={{
                                            color: isHovered ? 'white' : '#CC0000',
                                            backgroundColor: isHovered ? '#CC0000' : 'transparent',
                                            transition: 'background-color 0.3s, color 0.3s'
                                        }}
                                    >
                                        <span>Unpublish</span>
                                        <span >{window.navigator.platform.toLowerCase().includes("mac") ? <><BsCommand /> + U</>  : <span>Ctrl + U</span>}</span>
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
                        key={pageId}
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