"use client"
import React, { useEffect } from 'react';
import RenderPageContent from '../../components/pages/renderPageContent';
import DisplayUserAndModifiedData from '../../components/common/userService';
import { IoDocumentTextOutline } from 'react-icons/io5';
import Providers from '../../app/providers/providers';
import { getProxyToken } from '../../components/auth/authServiceV2';
import { functionTypes } from '../../components/common/functionType';
import './publicPage.scss';

function PublicPage(props) {
    const modifiedContent = props?.pageContentDataSSR?.contents;

    useEffect(() => {
        if (props?.webToken) return;
        const scriptId = "chatbot-main-script"
        const chatbot_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1OTgyIiwiY2hhdGJvdF9pZCI6IjY2NTQ3OWE4YmQ1MDQxYWU5M2ZjZDNjNSIsInVzZXJfaWQiOiIxMjQifQ.aI4h6OmkVvQP5dyiSNdtKpA4Z1TVNdlKjAe5D8XCrew"
        const scriptSrc = "https://chatbot-embed.viasocket.com/chatbot-prod.js"
        if (chatbot_token && !document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.setAttribute("embedToken", chatbot_token);
            script.id = scriptId;
            document.head.appendChild(script);
            script.src = scriptSrc
        }

        if (typeof window?.SendDataToChatbot === 'function') {
            window?.SendDataToChatbot({
                bridgeName: 'page',
                variables: {
                    Proxy_auth_token: getProxyToken(),
                    collectionId: props?.pageContentDataSSR?.collectionId,
                    functionType: process.env.NEXT_PUBLIC_ENV === 'prod' ? functionTypes.prod : functionTypes.dev
                }
            })
        }
    }, [])

    return (
        <div className={`custom-display-public-page overflow-auto`}>
            <div className={`page-wrapper d-flex flex-column ${modifiedContent ? 'justify-content-between' : 'justify-content-center'}`}>
                {modifiedContent ? (
                    <div className='pageText d-flex justify-content-center align-items-start'>
                        <RenderPageContent pageContentDataSSR={{ ...props.pageContentDataSSR, contents: modifiedContent }} webToken={props?.webToken} />
                    </div>
                ) : (
                    <div className='d-flex flex-column justify-content-center align-items-center empty-heading-for-page'>
                        <IoDocumentTextOutline size={140} color='gray' />
                        <span className='empty-line'>
                            {props?.pageContentDataSSR?.name} is empty
                        </span>
                        <span className='mt-1 d-inline-block Modified-at font-12'>
                            <Providers>
                                <DisplayUserAndModifiedData />
                            </Providers>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PublicPage;
