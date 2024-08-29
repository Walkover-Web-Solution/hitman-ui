import React, { useRef } from 'react';
import AutoSuggest from 'env-autosuggest'
import { useSelector } from 'react-redux';

export default function GenericTableAutoSuggest() {

    const genericAutoSuggestRef = useRef(null);

    const { currentEnvironment } = useSelector((state) => {
        return {
            currentEnvironment: state?.environment?.environments[state?.environment?.currentEnvironmentId]?.variables || {},
        }
    })

    return (
        <div>
            <AutoSuggest
                contentEditableDivRef={genericAutoSuggestRef}
                suggestions={currentEnvironment}
                initial={'<span text-block="true"></span>'}
            />
        </div>
    )
}
