import React from 'react'
import Authorization from './displayAuthorization'
import Script from './script/script'
import QueryTab from './queryTab/queryTab'
import { getCurrentUser } from '../auth/authServiceV2'

const DisplayEndpointHeadersContainer = (props) => {

    const handleScriptChange = (text, type) => {
        let preScriptText = props?.endpointContent?.preScriptText || ''
        let postScriptText = props?.endpointContent?.postScriptText || ''
        if (type === 'Pre-Script') {
            preScriptText = text
        } else {
            postScriptText = text
        }
        props.setModifiedTabData()
        const dummyData = props.endpointContent
        dummyData.preScriptText = preScriptText
        dummyData.postScriptText = postScriptText
        props.setQueryUpdatedData(dummyData)
    }

    const renderScriptError = () => {
        return (
            <>
                {props.state.postReqScriptError ? (
                    <div className='script-error'>{`There was an error in evaluating the Post-request Script: ${props.state.postReqScriptError}`}</div>
                ) : null}
                {props.state.preReqScriptError ? (
                    <div className='script-error'>{`There was an error in evaluating the Pre-request Script: ${props.state.preReqScriptError}`}</div>
                ) : null}
            </>
        )
    }

    return (
        <div className={props.isDashboardAndTestingView() ? 'endpoint-headers-container d-flex' : 'hm-public-endpoint-headers'}>
            <div className="main-table-wrapper">
                {props.isDashboardAndTestingView() ? (
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="headers-params-wrapper custom-tabs">
                            <ul className="nav nav-tabs" id="pills-tab" role="tablist">
                                {props.checkProtocolType(1) && (
                                    <>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'default' ? 'active' : ''}`}
                                                id={`pills-params-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#params-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`params-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'default'}
                                                onClick={() => props.setActiveTab()}
                                            >
                                                Params
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'authorization' ? 'active' : ''}`}
                                                id={`pills-authorization-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#authorization-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`authorization-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'authorization'}
                                                onClick={() => props.setActiveTab('authorization')}
                                            >
                                                Authorization
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'headers' ? 'active' : ''}`}
                                                id={`pills-headers-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#headers-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`headers-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'headers'}
                                                onClick={() => props.setActiveTab('headers')}
                                            >
                                                Headers
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'body' ? 'active' : ''}`}
                                                id={`pills-body-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#body-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`body-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'body'}
                                                onClick={() => props.setActiveTab('Body')}
                                            >
                                                Body
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'pre-script' ? 'active' : ''}`}
                                                id={`pills-pre-script-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#pre-script-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`pre-script-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'pre-script'}
                                                onClick={() => props.setActiveTab('pre-script')}
                                            >
                                                Pre-Script
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'post-script' ? 'active' : ''}`}
                                                id={`pills-post-script-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#post-script-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`post-script-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'post-script'}
                                                onClick={() => props.setActiveTab('post-script')}
                                            >
                                                Post-Script
                                            </a>
                                        </li>
                                        {getCurrentUser() && (
                                            <li className="nav-item cookie-tab">
                                                <a
                                                    className={`nav-link ${props.activeTab === 'cookies' ? 'active' : ''}`}
                                                    onClick={() => props.setCookiesModal()}
                                                >
                                                    Cookies
                                                </a>
                                            </li>
                                        )}
                                    </>
                                )}
                                {props.checkProtocolType(2) && (
                                    <>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'default' ? 'active' : ''}`}
                                                id={`pills-query-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#query-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`query-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'default'}
                                                onClick={() => props.setActiveTab()}
                                            >
                                                Query
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'authorization' ? 'active' : ''}`}
                                                id={`pills-authorization-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#authorization-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`authorization-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'authorization'}
                                                onClick={() => props.setActiveTab('authorization')}
                                            >
                                                Authorization
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'headers' ? 'active' : ''}`}
                                                id={`pills-headers-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#headers-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`headers-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'headers'}
                                                onClick={() => props.setActiveTab('headers')}
                                            >
                                                Headers
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'pre-script' ? 'active' : ''}`}
                                                id={`pills-pre-script-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#pre-script-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`pre-script-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'pre-script'}
                                                onClick={() => props.setActiveTab('pre-script')}
                                            >
                                                Pre-Script
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a
                                                className={`nav-link ${props.activeTab === 'post-script' ? 'active' : ''}`}
                                                id={`pills-post-script-tab-${props.tab.id}`}
                                                data-toggle="pill"
                                                href={`#post-script-${props.tab.id}`}
                                                role="tab"
                                                aria-controls={`post-script-${props.tab.id}`}
                                                aria-selected={props.activeTab === 'post-script'}
                                                onClick={() => props.setActiveTab('post-script')}
                                            >
                                                Post-Script
                                            </a>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                ) : null}

                {props.isDashboardAndTestingView() ? (
                    <div className="tab-content" id="pills-tabContent">
                        {props.checkProtocolType(1) && (
                            <>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'default' ? 'show active' : ''}`}
                                    id={`params-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-params-tab-${props.tab.id}`}
                                >
                                    {props.renderParams()}
                                    <div>{props.renderPathVariables()}</div>
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'authorization' ? 'show active' : ''}`}
                                    id={`authorization-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-authorization-tab-${props.tab.id}`}
                                >
                                    <div>
                                        <Authorization
                                            {...props}
                                            set_authorization_headers={props.setHeaders.bind(this)}
                                            set_authoriztaion_params={props.setParams.bind(this)}
                                            set_authoriztaion_type={props.setAuthType.bind(this)}
                                            handleSaveEndpoint={props.handleSave.bind(this)}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'headers' ? 'show active' : ''}`}
                                    id={`headers-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-headers-tab-${props.tab.id}`}
                                >
                                    <div>{props.renderHeaders()}</div>
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'body' ? 'show active' : ''}`}
                                    id={`body-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-body-tab-${props.tab.id}`}
                                >
                                    {props.renderBodyContainer()}
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'pre-script' ? 'show active' : ''}`}
                                    id={`pre-script-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-pre-script-tab-${props.tab.id}`}
                                >
                                    <div>
                                        <Script
                                            type="Pre-Script"
                                            handleScriptChange={handleScriptChange.bind(this)}
                                            scriptText={props?.endpointContent?.preScriptText}
                                            endpointContent={props?.endpointContent}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'post-script' ? 'show active' : ''}`}
                                    id={`post-script-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-post-script-tab-${props.tab.id}`}
                                >
                                    <div>
                                        <Script
                                            type="Post-Script"
                                            handleScriptChange={handleScriptChange.bind(this)}
                                            scriptText={props?.endpointContent?.postScriptText}
                                            endpointContent={props?.endpointContent}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {props.checkProtocolType(2) && (
                            <>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'default' ? 'show active' : ''}`}
                                    id={`query-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-query-tab-${props.tab.id}`}
                                >
                                    <QueryTab
                                        endpointContent={props.endpointContent}
                                        setQueryTabBody={props.setQueryTabBody.bind(this)}
                                        endpointId={props.endpointId}
                                    />
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'authorization' ? 'show active' : ''}`}
                                    id={`authorization-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-authorization-tab-${props.tab.id}`}
                                >
                                    <div>
                                        <Authorization
                                            {...props}
                                            set_authorization_headers={props.setHeaders.bind(this)}
                                            set_authoriztaion_params={props.setParams.bind(this)}
                                            set_authoriztaion_type={props.setAuthType.bind(this)}
                                            handleSaveEndpoint={props.handleSave.bind(this)}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'headers' ? 'show active' : ''}`}
                                    id={`headers-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-headers-tab-${props.tab.id}`}
                                >
                                    <div>{props.renderHeaders()}</div>
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'pre-script' ? 'show active' : ''}`}
                                    id={`pre-script-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-pre-script-tab-${props.tab.id}`}
                                >
                                    <div>
                                        <Script
                                            type="Pre-Script"
                                            handleScriptChange={handleScriptChange.bind(this)}
                                            scriptText={props?.endpointContent?.preScriptText}
                                            endpointContent={props?.endpointContent}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`tab-pane fade ${props.activeTab === 'post-script' ? 'show active' : ''}`}
                                    id={`post-script-${props.tab.id}`}
                                    role="tabpanel"
                                    aria-labelledby={`pills-post-script-tab-${props.tab.id}`}
                                >
                                    <div>
                                        <Script
                                            type="Post-Script"
                                            handleScriptChange={handleScriptChange.bind(this)}
                                            scriptText={props?.endpointContent?.postScriptText}
                                            endpointContent={props?.endpointContent}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    props.renderDocView()
                )}
            </div>
            {props.isDashboardAndTestingView() && renderScriptError()}
            {props.displayResponse()}
        </div>
    )
}

export default DisplayEndpointHeadersContainer