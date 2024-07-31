import React from "react";
import './page.scss'

const Page = () => {
    return <div className="parent-page-container" >
        <div className="page-header" >
            <input className="header-page-name" defaultValue="Anya's first page" type="text" />

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
                defaultValue="Anya's first page"
                placeholder="Untitled"
            />
        </div>
    </div>
}

export default Page