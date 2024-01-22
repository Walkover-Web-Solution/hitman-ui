import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CollectionParentPages from '../collectionVersions/collectionParentPages'
import CollectionVersions from '../collectionVersions/collectionVersions'
import Groups from '../groups/groups'
import Endpoints from '../endpoints/endpoints'

function CombinedCollections(props) {
  const { childIds, pages, ON_PUBLISH_DOC, defaultVersionId, defaultVersion } = useSelector((state) => {
    return {
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      pages: state.pages
      // defaultVersionId: props?.defaultVersionId,
      // defaultVersion: props?.defaultVersion
    }
  })

  return (
    <div>
      {childIds.map((singleId) => {
        const type = pages?.[singleId]?.type || null
        // console.log('I want to check the ispublishdata', props?.isPublishData);
        switch (type) {
          case 1:
            return <CollectionParentPages key={singleId} {...props} rootParentId={singleId} ON_PUBLISH_DOC={ON_PUBLISH_DOC} />
          // case 2:
          //   return <CollectionVersions  key={singleId} {...props} rootParentId={singleId} ON_PUBLISH_DOC={ON_PUBLISH_DOC}/>
          case 3:
            return <Groups key={singleId} {...props} rootParentId={singleId} ON_PUBLISH_DOC={ON_PUBLISH_DOC} />
          case 4:
            return <Endpoints key={singleId} {...props} endpointId={singleId} ON_PUBLISH_DOC={ON_PUBLISH_DOC} />
          default:
            break
        }
      })}
    </div>
  )
}

export default CombinedCollections
