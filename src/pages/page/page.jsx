import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTabContent, updateDraft } from '../../components/tabs/redux/tabsActions'
import Tiptap from '../../components/tiptapEditor/tiptap'
import { debounce } from 'lodash'
import './page.scss'
import { updatePage } from '../../components/pages/redux/pagesActions'
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsThreeDots } from 'react-icons/bs'
import moment from 'moment'
import SaveAsPageSidebar from '../../components/endpoints/saveAsSidebar1'

const Page = () => {
    const dispatch = useDispatch()
    const params = useParams()
    const { pageId } = useParams()

    const [editorKey, setEditorKey] = useState(0)
    const [sidebar, setSidebar] = useState(false)
    const pages = useSelector((state) => state.pages)
    const users = useSelector((state) => state.users.usersList)
    const { draftContent, page } = useSelector((state) => ({
        draftContent: state.tabs.tabs[pageId]?.draft,
        page: state?.pages[pageId]
    }))
    const [pageName, setPageName] = useState(page?.name)
    const updatedById = pages?.[pageId]?.updatedBy
    const lastModified = pages?.[pageId]?.updatedAt ? moment(pages[pageId].updatedAt).fromNow() : null
    const user = users?.find((user) => user.id === updatedById)

    useEffect(() => {
        if (params.route && !params?.route?.includes('new')) {
            if (draftContent === undefined) dispatch(fetchTabContent(pageId))
            
        }
        setPageName(page?.name)
    }, [pageId, draftContent, page])

    useEffect(() => {
        setTimeout(() => {
            setEditorKey((prevKey) => prevKey + 1)
        }, 1000)
    }, [pageId])

    const debounceUpdateDraft = useCallback(
        debounce((pageId, content) => {
            dispatch(updateDraft(pageId, content))
        }, 500),
        [dispatch]
    )

    const handleContentChange = (newContent) => {
        debounceUpdateDraft(pageId, newContent)
    }

    const handlePageNameChange = (event) => {
        setPageName(event.target.value)
    }

    const handlePageNameKeyDown = (event) => {
        if (event.key === 'Enter') {
            const editorInput = document.querySelector('#tiptap-editor [contenteditable="true"]')
            if (editorInput) {
                editorInput.focus()
            }
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
                            <button>Edited By</button>
                        </OverlayTrigger>
                    </div>
                    <div className='button'>
                        <button onClick={() => setSidebar(true)}>Save</button>
                    </div>
                    <div className='inner-operations'>
                        <Dropdown>
                            <Dropdown.Toggle as='div' id='dropdown-basic' className='button-style button'>
                                <div className='text-dark'>
                                    <BsThreeDots />
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => console.log('Publish')}>Publish</Dropdown.Item>
                                <Dropdown.Item onClick={() => console.log('Unpublish')}>UnPublish</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
            <div className='page-container'>
                <input
                    className='page-name'
                    type='text'
                    value={pageName}
                    placeholder='Untitled'
                    onChange={handlePageNameChange}
                    onKeyDown={handlePageNameKeyDown}
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
            {sidebar && (
                <SaveAsPageSidebar
                    name="Anya's first page"
                    onHide={() => setSidebar(false)}
                    handleSubmit={() => {
                        console.log('Page saved')
                        setSidebar(false)
                    }}
                />
            )}
        </div>
    )
}
export default Page
