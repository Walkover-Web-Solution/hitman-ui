import React from "react";
import { useSelector } from "react-redux";
import CollectionParentPages from "../collectionVersions/collectionParentPages";

function CombinedCollections(props) {
  const { childIds, sidebarPages } = useSelector((state) => {
    return {
      childIds: state?.sidebarV2Reducer?.sideBarPages?.[props?.rootParentId]?.child ||  [],
      sidebarPages: state.sidebarV2Reducer.sideBarPages,
    };
  });

  return (
    <div>
      {childIds.map((singleId) => {
        const type = sidebarPages?.[singleId]?.type || null;
        switch (type) {
          case 1:
            return <CollectionParentPages {...props} rootParentId={singleId} />;
          case 2:
            return null;
          case 3:
            return null;
          case 4:
            return null;
          default:
            break;
        }
      })}
    </div>
  );
}

export default CombinedCollections;
