import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchTabContent, updateDraft } from "../../components/tabs/redux/tabsActions";
import Tiptap from "../../components/tiptapEditor/tiptap";
import { debounce } from "lodash";
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsThreeDots } from 'react-icons/bs'
import moment from 'moment'
import { updatePageContent, updatePageName } from '../../components/pages/redux/pagesActions'
import SaveAsPageSidebar from '../../components/endpoints/saveAsSidebar1'
import IconButton from '../../components/common/iconButton'
import './page.scss'
import { toast } from "react-toastify";

const Page = () => {
    const dispatch = useDispatch()
    const { pageId } = useParams()

    const [editorKey, setEditorKey] = useState(0)
    const [sidebar, setSidebar] = useState(false)

    const { draftContent, page, pages, users, activeTabId, tabs } = useSelector((state) => ({
        draftContent: !pageId?.includes('new') ? state.tabs.tabs[pageId]?.draft : '',
        page: state?.pages[pageId],
        pages: state.pages,
        users: state.users.usersList,
        activeTabId: state.tabs.activeTabId,
        tabs: state.tabs.tabs,
    }))

    const [pageName, setPageName] = useState(page?.name)
    const updatedById = pages?.[pageId]?.updatedBy
    const lastModified = pages?.[pageId]?.updatedAt ? moment(pages[pageId].updatedAt).fromNow() : null
    const user = users?.find((user) => user.id === updatedById)

    useEffect(() => {
        if (draftContent === undefined && !pageId.includes('new')) {
            toast.success("API called")
            dispatch(fetchTabContent(activeTabId))
        }
        setPageName(page?.name || 'Untitled')
        setTimeout(() => {
            setEditorKey((prevKey) => prevKey + 1)
        }, 1000)
    }, [pageId, activeTabId])

    const handleSavePage = () => {
        if (pageId.includes('new')) setSidebar(true)
        else dispatch(updatePageContent(page.id, draftContent, pageName))
    }

    const debounceUpdateDraft = useCallback(
        debounce((activeTabId, content) => {
            dispatch(updateDraft(activeTabId, content))
        }, 500),
        [dispatch]
    )

    const handleContentChange = (newContent) => {
        debounceUpdateDraft(activeTabId, newContent)
    }

    const handlePageNameChange = (event) => {
        setPageName(event.target.value)
    }

    const handleSavePageName = () => {
        if (tabs[activeTabId].status === "SAVED") dispatch(updatePageName(page.id, pageName))
    }


    const handlePageNameKeyDown = (event) => {
        if (event.key === 'Enter') {
            const editorInput = document.querySelector('#tiptap-editor [contenteditable="true"]')
            if (editorInput) {
                editorInput.focus()
            }
            handleSavePageName();
        }
    }

    return (
        <div className='parent-page-container'>
            <div className='page-header'>
                <input className='header-page-name' value={pageName} type='text' onChange={handlePageNameChange} />
                <div className='header-operations'>
                    <div className='button'>
                        <OverlayTrigger
                            placement='bottom'
                            overlay={
                                <Tooltip id='edited-by-tooltip'>
                                    <div>
                                        {lastModified ? (
                                            <div>
                                                Updated by<span> </span>
                                                {user?.name}
                                                <br />
                                                Modified At<span> </span>
                                                {lastModified}
                                            </div>
                                        ) : (
                                            <span>No Data</span>
                                        )}
                                    </div>
                                </Tooltip>
                            }
                        >
                            <button className='text-black-50'>Edited By</button>
                        </OverlayTrigger>
                    </div>
                    <div className='button'>
                        <IconButton><button onClick={handleSavePage} >Save</button></IconButton>
                    </div >
                    <div className='inner-operations'>
                        <Dropdown>
                            <Dropdown.Toggle as='div' id='dropdown-basic' className='button-style button'>
                                <div className='text-dark'>
                                    <IconButton><BsThreeDots size={18} /></IconButton>
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => console.log('Publish')}>Publish</Dropdown.Item>
                                <Dropdown.Item onClick={() => console.log('Unpublish')}>UnPublish</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div >
            </div >
            <div className='page-container'>
                <input
                    className='page-name'
                    type='text'
                    value={pageName}
                    placeholder='Untitled'
                    onChange={handlePageNameChange}
                    onKeyDown={handlePageNameKeyDown}
                    onBlur={handleSavePageName}
                />

                <div id='tiptap-editor' className='page-content'>
                    <Tiptap
                        key={`${pageId}-${editorKey}`}
                        onChange={handleContentChange}
                        initial={draftContent}
                        isInlineEditor={false}
                        disabled={false}
                    />
                </div>
            </div>
            {
                sidebar && (
                    <SaveAsPageSidebar
                        name="Anya's first page"
                        onHide={() => setSidebar(false)}
                        handleSubmit={() => {
                            console.log('Page saved')
                            setSidebar(false)
                        }}
                    />
                )
            }
        </div >
    )
}

export default Page