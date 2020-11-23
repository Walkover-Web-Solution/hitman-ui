function extractVersionsFromCollectionId(collectionId, props) {
    if (!collectionId) return {}
    let versions = {}
    for (let i = 0; i < Object.keys(props.versions).length; i++) {
        let versionId = Object.keys(props.versions)[i]
        if (props.versions[versionId].collectionId?.toString() === collectionId?.toString()) {
            versions[versionId] = props.versions[versionId]
        }
    }
    return versions
}

function extractGroupsFromVersions(versions, props) {
    if (versions === {}) return {}
    let groups = {}
    for (let i = 0; i < Object.keys(versions).length; i++) {
        let versionId = Object.keys(versions)[i]
        for (let j = 0; j < Object.keys(props.groups).length; j++) {
            let group = props.groups[Object.keys(props.groups)[j]]
            if (versionId.toString() === group?.versionId?.toString()) {
                groups[group.id] = group
            }
        }
    }
    return groups
}

function extractPagesFromVersions(versions, props) {
    if (versions === {}) return {}
    let pages = {}
    for (let i = 0; i < Object.keys(versions).length; i++) {
        let versionId = Object.keys(versions)[i]
        for (let j = 0; j < Object.keys(props.pages).length; j++) {
            let page = props.pages[Object.keys(props.pages)[j]]
            if (versionId.toString() === page.versionId?.toString()) {
                pages[page.id] = page
            }
        }
    }
    return pages
}

function extractEndpointsFromGroups(groups, props) {
    if (groups === {}) return {}
    let endpoints = {}
    for (let i = 0; i < Object.keys(groups).length; i++) {
        let groupId = Object.keys(groups)[i]
        for (let j = 0; j < Object.keys(props.endpoints).length; j++) {
            let endpoint = props.endpoints[Object.keys(props.endpoints)[j]]
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
};