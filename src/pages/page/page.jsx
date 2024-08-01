import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchTabContent, updateDraft } from "../../components/tabs/redux/tabsActions";
import Tiptap from "../../components/tiptapEditor/tiptap";
import { debounce } from "lodash";
import './page.scss'
import { updatePage } from "../../components/pages/redux/pagesActions";

const Page = () => {

    const dispatch = useDispatch();
    const { pageId } = useParams();
    const { draftContent, page } = useSelector((state) => ({
        draftContent: state.tabs.tabs[pageId]?.draft,
        page: state?.pages[pageId],
    }))

    const [editorKey, setEditorKey] = useState(0);
    const [pageName, setPageName] = useState(page?.name)

    useEffect(() => {
        if (draftContent === undefined) dispatch(fetchTabContent(pageId))
        setPageName(page?.name)
    }, [pageId, draftContent, page])

    useEffect(() => {
        setTimeout(() => { setEditorKey(prevKey => prevKey + 1) }, 1000);
    }, [pageId])

    const debounceUpdateDraft = useCallback(
        debounce((pageId, content) => {
            dispatch(updateDraft(pageId, content));
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
            const editorInput = document.querySelector('#tiptap-editor [contenteditable="true"]');
            if (editorInput) {
                editorInput.focus();
            }
        }
    }

    return (
        <div className="parent-page-container" >
            <div className="page-header" >
                <input className="header-page-name" value={pageName} type="text" onChange={handlePageNameChange} />
                <div className="header-operations" >
                    <button>Edited By</button>
                    <button >Save</button>
                    <button>...</button>
                </div>
            </div>
            <div className="page-container" >
                <input
                    className="page-name"
                    type="text"
                    value={pageName}
                    placeholder="Untitled"
                    onChange={handlePageNameChange}
                    onKeyDown={handlePageNameKeyDown}
                />
                <div id="tiptap-editor" className="page-content" >
                    <Tiptap
                        key={`${pageId}-${editorKey}`}
                        onChange={handleContentChange}
                        initial={draftContent}
                        isInlineEditor={false}
                        disabled={false}
                    />
                </div>
            </div>
        </div>
    )
}

export default Page