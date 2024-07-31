import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchTabContent } from "../../components/tabs/redux/tabsActions";
import Tiptap from "../../components/tiptapEditor/tiptap";
import './page.scss'

const Page = () => {
    const dispatch = useDispatch();
    const { pageId } = useParams();
    const { pageContent, page } = useSelector((state) => {
        return {
            pageContent: state?.tabs?.tabs[pageId]?.draft,
            page: state?.pages[pageId]
        }
    })

    const [pageName, setPageName] = useState(page?.name)
    const [content, setcontent] = useState(pageContent)

    useEffect(() => {
        dispatch(fetchTabContent(pageId))
        setcontent(pageContent)
        setPageName(page?.name)
    }, [pageId, dispatch, page?.name, pageContent])


    return <div className="parent-page-container" >
        <div className="page-header" >
            <input className="header-page-name" value={pageName} type="text" />

            <div className="header-operations" >
                <button>Edited By</button>
                <button>Save</button>
                <button>...</button>
            </div>
        </div>
        <div className="page-container" >
            <input
                className="page-name"
                type="text"
                value={pageName}
                placeholder="Untitled"
            />

            <div className="page-content" >
                <Tiptap
                    isInlineEditor
                    initial={content}
                />

                <br />
                {content ? content : 'write here'}
            </div>
        </div>
    </div>
}

export default Page