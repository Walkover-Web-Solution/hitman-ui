"use client"
import React from 'react'
import { useEffect } from 'react' 
import 'bootstrap/dist/css/bootstrap.css'
import 'react-toastify/dist/ReactToastify.css'
import '../index.scss'
import "../components/auth/auth.scss";
import "./(other)/login/login.scss";
import './(other)/onBoarding/onBoarding.scss';
import "./(other)/orgs/[orgId]/trash/trash.scss"
import "./(other)/orgs/[orgId]/invite/inviteTeam.scss"
import "./(other)/orgs/[orgId]/collection/[collectionId]/redirections/redirections.scss"
import "./(other)/orgs/[orgId]/collection/[collectionId]/runner/runAutomation.scss"
import '../components/main/responsive.scss'
import "../components/publicEndpoint/publicEndpoint.scss"
import "../components/main/main.scss"
import "../components/indexWebsite/indexWebsite.scss"
import "../components/tabs/tabs.scss"

export default function RootLayout({ children }) {
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

    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://unicons.iconscout.com/release/v2.1.9/css/unicons.css" />
                <link id='favicon' rel="icon" href="/favicon.svg" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet" />
                
                <link
                rel="preload"
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
                as="style"
                onLoad="this.onload=null;this.rel='stylesheet'"
            />
            <noscript>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" />
            </noscript>
                
                
                
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
                <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
                <script src="https://unpkg.com/react-jsonschema-form/dist/react-jsonschema-form.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
            </head>
            <body>
                <div id="root">
                    {children}
                </div>
            </body>
        </html>
    );
}
