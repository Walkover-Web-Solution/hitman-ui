import React from 'react'
import { useSelector } from 'react-redux'
import CollectionParentPages from '../collectionVersions/collectionParentPages'
import CollectionVersions from '../collectionVersions/collectionVersions'
import Groups from '../groups/groups'
import Endpoints from '../endpoints/endpoints'

function CombinedCollections(props) {
  const { childIds, sidebarPages } = useSelector((state) => {
    return {
      childIds: state?.sidebarV2Reducer?.sideBarPages?.[props?.rootParentId]?.child || [],
      sidebarPages: state.sidebarV2Reducer.sideBarPages
    }
  })

  return (
<div>
      {childIds.map((singleId) => {
        const type = sidebarPages?.[singleId]?.type || null
        switch (type) {
          case 1:
            return <CollectionParentPages key={singleId} {...props} rootParentId={singleId} />
          case 2:
            return <CollectionVersions key={singleId} {...props} rootParentId={singleId} />
          case 3:
            return <Groups key={singleId} {...props} rootParentId={singleId} />
          case 4:
            return <Endpoints {...props} endpointId={singleId} />
          default:
            break
        }
      })}
    </div>
  )
}

export default CombinedCollections
