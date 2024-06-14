import React from 'react'
import moment from 'moment'

const DisplayUserAndModifiedData = ({ isOnPublishedPage, pages, currentPage, users }) => {
  const updatedById = pages?.[currentPage]?.updatedBy
  const lastModified = pages?.[currentPage]?.updatedAt ? moment(pages[currentPage].updatedAt).fromNow() : null

  const user = users?.find((user) => user.id === updatedById)

  if (isOnPublishedPage) {
    return (
      <div>
        {lastModified && (
          <>
            Modified At <span>{lastModified}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className='page-user-data mt-2'>
      {lastModified ? (
        <div>
          Updated by <span>{user?.name || 'Unknown'}</span>
          <br />
          Modified At <span>{lastModified}</span>
        </div>
      ) : (
        <span></span>
      )}
    </div>
  )
}

export default DisplayUserAndModifiedData
