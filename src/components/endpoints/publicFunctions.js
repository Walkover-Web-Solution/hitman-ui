

function renderPublicHost() {
    return (
      <div>
        {/* do not remove this code */}
        {/* <h3 className='heading-2'>Endpoint Name</h3> */}
        <div className='hm-endpoint-header'>
          <div className='input-group'>
            {this.checkProtocolType(1) && (
              <div className='input-group-prepend'>
                <span className={`api-label api-label-lg input-group-text ${this.props?.endpointContent?.data?.method}`}>
                  {this.props?.endpointContent?.data?.method}
                </span>
              </div>
            )}
            <HostContainer
              {...this.props}
              environmentHost={
                this.props?.environment?.variables?.BASE_URL?.currentValue ||
                this.props?.environment?.variables?.BASE_URL?.initialValue ||
                ''
              }
              updatedUri={_.cloneDeep(this.props?.endpointContent?.data?.updatedUri)}
              set_base_url={this.setBaseUrl.bind(this)}
              // customHost={this.props?.endpointContent?.host.BASE_URL || ''}
              endpointId={this.props?.params?.endpointId}
              set_host_uri={this.setHostUri.bind(this)}
              props_from_parent={this.propsFromChild.bind(this)}
              setQueryUpdatedData={this.props.setQueryUpdatedData.bind(this)}
              untitledEndpointData={_.cloneDeep(this.props.untitledEndpointData)}
            />
          </div>
          {this.props?.highlights?.uri ? <i className='fas fa-circle' /> : null}
        </div>
        <input ref={this.uri} type='hidden' value={this.props?.endpointContent?.data?.updatedUri} name='updatedUri' />
      </div>
    )
  }

 function renderPublicBodyContainer() {
    return (
      this.props?.endpointContent?.data?.body &&
      // this.props?.endpointContent?.originalBody &&
      this.props?.endpointContent?.data?.body?.value !== null && (
        <PublicBodyContainer
          {...this.props}
          set_body={this.setBody.bind(this)}
          set_body_description={this.setDescription.bind(this)}
          body={this.props?.endpointContent?.data?.body}
          original_body={this.props?.endpointContent?.data?.body}
          public_body_flag={this.props?.endpointContent?.publicBodyFlag}
          set_public_body={this.setPublicBody.bind(this)}
          body_description={this.props?.endpointContent?.bodyDescription}
          publicCollectionTheme={this.props?.publicCollectionTheme}
          setQueryTabBody={this.setQueryTabBody.bind(this)}
        />
      )
    )
  }

 function renderPublicHeaders() {
    return (
      this.props?.endpointContent?.originalHeaders?.length > 0 && (
        <GenericTable
          {...this.props}
          title='Headers'
          dataArray={this.props?.endpointContent?.originalHeaders}
          props_from_parent={this.propsFromChild.bind(this)}
          original_data={[...this.props?.endpointContent?.originalHeaders]}
          currentView={this.props?.endpointContent?.currentView}
        />
      )
    )
  }

  function renderPublicParams() {
    return (
      this.props?.endpointContent?.originalParams?.length > 0 && (
        <div>
          <GenericTable
            {...this.props}
            title='Params'
            dataArray={this.props?.endpointContent?.originalParams || []}
            props_from_parent={this.propsFromChild.bind(this)}
            original_data={this.props?.endpointContent?.originalParams}
            currentView={this.props?.endpointContent?.currentView}
          />
        </div>
      )
    )
  }

 function renderPublicPathVariables() {
    return (
      this.props?.endpointContent?.pathVariables &&
      this.props?.endpointContent?.pathVariables?.length !== 0 && (
        <div>
          <GenericTable
            {...this.props}
            title='Path Variables'
            dataArray={this.props?.endpointContent?.pathVariables}
            props_from_parent={this.propsFromChild.bind(this)}
            original_data={this.props?.endpointContent?.pathVariables}
            currentView={this.props?.endpointContent?.currentView}
          />
        </div>
      )
    )
  }

 function  displayPublicSampleResponse() {
    if (this.props?.endpointContent?.sampleResponseArray?.length) {
      return (
        <div className='mt-3'>
          <PublicSampleResponse
            highlights={this.props?.highlights}
            sample_response_array={this.props?.endpointContent?.sampleResponseArray}
            publicCollectionTheme={this.props?.publicCollectionTheme}
          />
        </div>
      )
    }
  }

module.exports = {
    displayPublicSampleResponse,
    renderPublicPathVariables,
    renderPublicParams,
    renderPublicHeaders,
    renderPublicBodyContainer,
    renderPublicHost
}