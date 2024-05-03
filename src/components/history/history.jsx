import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { ReactComponent as EmptyHistory } from '../../assets/icons/emptyHistroy.svg'
import { Dropdown } from 'react-bootstrap'
import './history.scss'

function compareByCreatedAt(a, b) {
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
    endpoints: state.pages,
    collections: state.collections
  }
}

class History extends Component {
  state = {
    show: false,
    historySnapshot: null
  }

  componentDidMount() {
    if (this.props.historySnapshots) {
      this.setState({
        historySnapshot: Object.values(this.props.historySnapshots)
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.historySnapshots !== prevProps.historySnapshots) {
      this.setState({
        historySnapshot: Object.values(this.props.historySnapshots)
      })
    }
  }

  openHistorySnapshot(id) {
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/history/${id}`,
      historySnapshotId: id
    })
  }

  renderName(history) {
    const baseUrl = history?.endpoint?.BASE_URL ? history?.endpoint?.BASE_URL + history?.endpoint?.uri : history?.endpoint?.uri
    const endpointName = history?.endpoint?.name || baseUrl || 'Random Trigger'
    return endpointName
  }

  // renderPath(id) {
  //   let path = ''
  //   let groupId = null
  //   let versionId = null
  //   let collectionId = null
  //   let endpointId = null

  //   endpointId = id
  //   groupId = this.props.endpoints[endpointId]?.groupId
  //   versionId = this.props.groups[groupId]?.versionId
  //   collectionId = this.props.versions[versionId]?.collectionId
  //   path =
  //     this.props.collections[collectionId]?.name + ' > ' + this.props.versions[versionId]?.number + ' > ' + this.props.groups[groupId]?.name

  //   if (id && path) {
  //     return (
  //       <div style={{ fontSize: '11px' }} className='text-muted'>
  //         {path}
  //       </div>
  //     )
  //   } else return <p />
  // }

  renderHistoryItem(history) {
    return (
      Object.keys(history).length !== 0 && (
        <Dropdown.Item
          key={history.id}
          className='btn d-flex align-items-center mb-2 pt-2'
          onClick={() => {
            this.openHistorySnapshot(history.id)
          }}
        >
          <div className={`api-label lg-label ${history?.endpoint?.requestType}`}>
            <div className='endpoint-request-div'>{history?.endpoint?.requestType}</div>
          </div>
          <div className='ml-3'>
            <div className='sideBarListWrapper'>
              <div className='text-left'>
                <p>
                  {this.renderName(history)}
                  {/* {this.renderPath(history.endpoint.id)} */}
                </p>
              </div>
              <small className='text-muted'>{moment(history.createdAt).format('ddd, Do MMM h:mm a')}</small>
            </div>
          </div>
        </Dropdown.Item>
      )
    )
  }

  renderHistoryList() {
    const { historySnapshot } = this.state
    if (!historySnapshot || historySnapshot.length === 0) {
      return (
        <div className='empty-collections text-center'>
          <div>
            <EmptyHistory />
          </div>
          <div className='content'>
            <h5>No History available.</h5>
          </div>
        </div>
      )
    }
    const groupedHistory = {}

    historySnapshot.forEach((history) => {
      const today = moment().startOf('day')
      const createdAtMoment = moment(history.createdAt)
      let dateGroup

      if (today.isSame(createdAtMoment, 'day')) {
        dateGroup = 'Today'
      } else if (createdAtMoment.isSame(today.clone().subtract(1, 'days'), 'day')) {
        dateGroup = 'Yesterday'
      } else {
        dateGroup = createdAtMoment.format('MMMM D, YYYY')
      }

      if (!groupedHistory[dateGroup]) {
        groupedHistory[dateGroup] = []
      }

      groupedHistory[dateGroup].push(history)
    })
    const sortedGroupedHistory = Object.entries(groupedHistory).sort(([dateGroupA], [dateGroupB]) => {
      if (dateGroupA === 'Today') return -1
      if (dateGroupB === 'Today') return 1
      if (dateGroupA === 'Yesterday') return -1
      if (dateGroupB === 'Yesterday') return 1
      return moment(dateGroupB, ['MMMM D, YYYY']).diff(moment(dateGroupA, ['MMMM D, YYYY']))
    })

    const dropdowns = sortedGroupedHistory.map(([dateGroup, histories]) => (
      <ul key={dateGroup}>
        <li>
          <h6 className='pb-4 ml-3'>{dateGroup}</h6>
          <ul>
            {histories.sort(compareByCreatedAt).map((history) => (
              <li
                key={history.id}
                onClick={() => {
                  this.openHistorySnapshot(history.id)
                }}
              >
                {this.renderHistoryItem(history)}
              </li>
            ))}
          </ul>
        </li>
      </ul>
    ))
    return <div className='mt-3 dropdown-menu-center px-2'>{dropdowns}</div>
  }

  render() {
    return this.renderHistoryList()
  }
}
export default connect(mapStateToProps, null)(History)
