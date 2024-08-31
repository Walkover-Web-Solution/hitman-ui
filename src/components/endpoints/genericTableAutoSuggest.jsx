import React, { useEffect, useRef } from 'react';
import AutoSuggest from 'env-autosuggest';
import { useSelector } from 'react-redux';

export default function GenericTableAutoSuggest(props) {

    const genericAutoSuggestRef = useRef(null);

    const { currentEnvironment } = useSelector((state) => {
        return {
            currentEnvironment: state?.environment?.environments[state?.environment?.currentEnvironmentId]?.variables || {},
        };
    });

    useEffect(() => {
        if (genericAutoSuggestRef.current) {
            genericAutoSuggestRef.current.innerHTML = props?.htmlValue;
        }
    }, [props?.htmlValue]);

    return (
        <div>
            <AutoSuggest
                contentEditableDivRef={genericAutoSuggestRef}
                suggestions={currentEnvironment}
            />
        </div>
    );
}



