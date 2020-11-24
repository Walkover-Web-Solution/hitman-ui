function extractVersionsFromCollectionId (collectionId, props) {
  if (!collectionId) return {}
  const versions = {}
  for (let i = 0; i < Object.keys(props.versions).length; i++) {
    const versionId = Object.keys(props.versions)[i]
    if (props.versions[versionId].collectionId?.toString() === collectionId?.toString()) {
      versions[versionId] = props.versions[versionId]
    }
  }
  return versions
}

function extractGroupsFromVersions (versions, props) {
  if (versions === {}) return {}
  const groups = {}
  for (let i = 0; i < Object.keys(versions).length; i++) {
    const versionId = Object.keys(versions)[i]
    for (let j = 0; j < Object.keys(props.groups).length; j++) {
      const group = props.groups[Object.keys(props.groups)[j]]
      if (versionId.toString() === group?.versionId?.toString()) {
        groups[group.id] = group
      }
    }
  }
  return groups
}

function extractPagesFromVersions (versions, props) {
  if (versions === {}) return {}
  const pages = {}
  for (let i = 0; i < Object.keys(versions).length; i++) {
    const versionId = Object.keys(versions)[i]
    for (let j = 0; j < Object.keys(props.pages).length; j++) {
      const page = props.pages[Object.keys(props.pages)[j]]
      if (versionId.toString() === page.versionId?.toString()) {
        pages[page.id] = page
      }
    }
  }
  return pages
}

function extractEndpointsFromGroups (groups, props) {
  if (groups === {}) return {}
  const endpoints = {}
  for (let i = 0; i < Object.keys(groups).length; i++) {
    const groupId = Object.keys(groups)[i]
    for (let j = 0; j < Object.keys(props.endpoints).length; j++) {
      const endpoint = props.endpoints[Object.keys(props.endpoints)[j]]
      if (groupId.toString() === endpoint.groupId?.toString()) {
        endpoints[endpoint.id] = endpoint
      }
    }
  }
  return endpoints
}

export default {
  extractVersionsFromCollectionId,
  extractGroupsFromVersions,
  extractPagesFromVersions,
  extractEndpointsFromGroups
}
