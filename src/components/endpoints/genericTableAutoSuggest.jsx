import React, { useRef } from 'react';
import { restoreCaretPosition, getCaretPosition } from '../../utilities/caretUtility';
import AutoSuggest from 'env-autosuggest';
import { useSelector } from 'react-redux';

function GenericTableAutoSuggest(props) {

    const { currentEnvironment } = useSelector((state) => {
        return {
            currentEnvironment: state?.environment?.environments[state?.environment?.currentEnvironmentId]?.variables || {},
        };
    });

    const genericAutoSuggestRef = useRef(null);

    const handleValueChange = () => {
        const caretPosition = getCaretPosition(genericAutoSuggestRef.current);
        const value = genericAutoSuggestRef.current.innerHTML;
        props.handleChange(value, { name: props?.valueKey, value: value });
        setTimeout(() => restoreCaretPosition(genericAutoSuggestRef.current, caretPosition), 0);
    }

    return (
        <div>
            <AutoSuggest
                contentEditableDivRef={genericAutoSuggestRef}
                suggestions={currentEnvironment}
                handleValueChange={handleValueChange}
                initial={props?.htmlValue}
            />
        </div>
    );
}

export default React.memo(GenericTableAutoSuggest)