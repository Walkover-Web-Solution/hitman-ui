import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { ReactComponent as EmptyHistory } from '../../assets/icons/emptyHistroy.svg'
import { Dropdown } from 'react-bootstrap'
import './history.scss'

function compareByCreatedAt (a, b) {
  const t1 = a?.createdAt
  const t2 = b?.createdAt
  let comparison = 0
  if (t1 < t2) {
    comparison = 1
  } else if (t1 > t2) {
    comparison = -1
  }
  return comparison
}

const mapStateToProps = (state) => {
  return {
    groups: state.groups,
    versions: state.versions,
    endpoints: state.endpoints,
    collections: state.collections
  }
}

class History extends Component {
    state = {
      show: false,
      historySnapshot: null
    }

    componentDidMount () {
      if (this.props.historySnapshots) {
        this.setState({
          historySnapshot: Object.values(this.props.historySnapshots)
        })
      }
    }

    componentDidUpdate (prevProps, prevState) {
      if (this.props.historySnapshots !== prevProps.historySnapshots) {
        this.setState({
          historySnapshot: Object.values(this.props.historySnapshots)
        })
      }
    }

    openHistorySnapshot (id) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/history/${id}`,
        historySnapshotId: id
      })
    }

    renderName (history) {
      const baseUrl = history.endpoint.BASE_URL ? history.endpoint.BASE_URL + history.endpoint.uri : history.endpoint.uri
      const endpointName = history.endpoint.name || baseUrl || 'Random Trigger'
      return endpointName
    }

    renderPath (id) {
      let path = ''
      let groupId = null
      let versionId = null
      let collectionId = null
      let endpointId = null

      endpointId = id
      groupId = this.props.endpoints[endpointId]?.groupId
      versionId = this.props.groups[groupId]?.versionId
      collectionId = this.props.versions[versionId]?.collectionId
      path = this.props.collections[collectionId]?.name + ' > ' + this.props.versions[versionId]?.number + ' > ' + this.props.groups[groupId]?.name

      if (id && path) { return <div style={{ fontSize: '11px' }} className='text-muted'>{path}</div> } else return <p />
    }

    renderHistoryItem (history) {
      return (
        Object.keys(history).length !== 0 && (
          <Dropdown.Item
            key={history.id}
            className='btn d-flex align-items-center mb-2'
            onClick={() => { this.openHistorySnapshot(history.id) }}
          >
            <div className={`api-label lg-label ${history.endpoint.requestType}`}>
              <div className='endpoint-request-div'>
                {history.endpoint.requestType}
              </div>
            </div>
            <div className='ml-3'>
              <div className='sideBarListWrapper'>
                <div className='text-left'>
                  <p>{this.renderName(history)}
                    {this.renderPath(history.endpoint.id)}
                  </p>
                </div>
                <small className='text-muted'>
                  {moment(history.createdAt).format('ddd, Do MMM h:mm a')}
                </small>
              </div>
            </div>
          </Dropdown.Item>
        )
      )
    }

    renderHistoryList () {
      return (
        <div className='mt-3'>
          {this.state.historySnapshot && this.state.historySnapshot.length > 0
            ? (this.state.historySnapshot.sort(compareByCreatedAt).map((history) => this.renderHistoryItem(history)))
            : (<div class='empty-collections text-center'><div><EmptyHistory /></div><div class='content'><h5>  No History available.</h5><p /></div></div>)}
        </div>
      )
    }

    render () {
      return (
        <div>
          {this.renderHistoryList()}
        </div>
      )
    }
}
export default connect(mapStateToProps, null)(History)
