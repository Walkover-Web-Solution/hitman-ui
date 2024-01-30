import React from 'react'
import { useSelector } from 'react-redux'
import CollectionParentPages from '../collectionVersions/collectionParentPages'
import Groups from '../groups/groups'
import Endpoints from '../endpoints/endpoints'

function CombinedCollections(props) {
  // debugger
  const { childIds, pages } = useSelector((state) => {
    return {
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      pages: state.pages
    }
  })
  // debugger
  return (
    <div>
      {childIds.map((singleId) => {
        const type = pages?.[singleId]?.type || null
        switch (type) {
          case 1:
            return <CollectionParentPages key={singleId} {...props} rootParentId={singleId} />
          case 3:
            return <Groups key={singleId} {...props} rootParentId={singleId} />
          case 4:
            return <Endpoints key={singleId} {...props} endpointId={singleId} />
          default:
            break
        }
      })}
    </div>
  )
}

export default CombinedCollections
