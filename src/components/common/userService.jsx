import React from 'react'
import moment from 'moment'

const DisplayUserAndModifiedData = ({ isOnPublishedPage, pages, currentPage, users }) => {
  const updatedById = pages?.[currentPage]?.updatedBy
  const lastModified = pages?.[currentPage]?.updatedAt ? moment(pages[currentPage].updatedAt).fromNow() : null
  const user = users?.find((user) => user.id === updatedById)

  if (isOnPublishedPage) {
    return (
      <div>
        {lastModified && <span>Modified at <span>{lastModified}</span></span>}
      </div>
    )
  }

  return (
    <div className='page-user-data'>
      {lastModified ? (
        <div>
          Updated by <span>{user?.name || 'Unknown'}</span>
          <br />
          <span>Modified at <span>{lastModified}</span></span>
        </div>
      ) : null}
    </div>
  )
}

export default DisplayUserAndModifiedData
