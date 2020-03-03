import collectionVersionsService from "./collectionVersionsService";
import versionActionTypes from "./collectionVersionsActionTypes";

export const fetchVersions = () => {
    return dispatch => {
        console.log("fetchVersions");
        collectionVersionsService
            .getAllCollectionVersions()
            .then(response => {
                const versions = response.data;
                dispatch(fetchVersionsSuccess(versions));
            })
            .catch(error => {
                dispatch(fetchVersionsFailure(error.message));
            });
    };
};

export const fetchVersionsSuccess = versions => {
    return {
        type: versionActionTypes.FETCH_VERSIONS_SUCCESS,
        payload: versions
    };
};

export const fetchVersionsFailure = error => {
    return {
        type: versionActionTypes.FETCH_VERSIONS_FAILURE,
        payload: error
    };
};

export const addVersion = newVersion => {
    return dispatch => {
        console.log(newVersion);
        dispatch(addVersionRequest(newVersion));
        collectionVersionsService
            .saveCollectionVersion(newVersion.collectionId, newVersion)
            .then(response => {
                dispatch(addVersionSuccess(response.data));
            })
            .catch(error => {
                dispatch(addVersionFailure(error.response.data, newVersion));
            });
    };
};

export const addVersionRequest = newVersion => {
    return {
        type: versionActionTypes.ADD_VERSION_REQUEST,
        newVersion
    };
};

export const addVersionSuccess = response => {
    return {
        type: versionActionTypes.ADD_VERSION_SUCCESS,
        response
    };
};

export const addVersionFailure = (error, newVersion) => {
    return {
        type: versionActionTypes.ADD_VERSION_FAILURE,
        newVersion,
        error
    };
};