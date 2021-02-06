import React, { Component } from 'react'
import moment from 'moment'
import { ReactComponent as EmptyHistory } from '../../assets/icons/emptyHistroy.svg'

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
        pathname: `/dashboard/history/${id}`,
        historySnapshotId: id
      })
    }

    renderHistoryItem (history) {
      return (
        Object.keys(history).length !== 0 && (
          <div
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
                  <p>{history.endpoint.name ||
                      history.endpoint.BASE_URL + history.endpoint.uri ||
                      'Random Trigger'}
                  </p>
                </div>
                <small className='text-muted'>
                  {moment(history.createdAt).format('ddd, Do MMM h:mm a')}
                </small>
              </div>
            </div>
          </div>
        )
      )
    }

    renderHistoryList () {
      return (
        <div className='mt-3'>
          {this.state.historySnapshot && this.state.historySnapshot.length > 0
            ? (this.state.historySnapshot.sort(compareByCreatedAt).map((history) => this.renderHistoryItem(history)))
            : (<div class='empty-collections'><div><EmptyHistory /></div><div class='content'><h5>  No History available.</h5><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div></div>)}
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
export default History
