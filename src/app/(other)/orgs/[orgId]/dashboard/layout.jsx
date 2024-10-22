"use client"
import React from 'react'
import { useEffect } from 'react'
import MainV2 from '../../../../../components/main/MainV2'

export default function Layout() {
    useEffect(() => {
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
    }, [])
    return <MainV2 />
}