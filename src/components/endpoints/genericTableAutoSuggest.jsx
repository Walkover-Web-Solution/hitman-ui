import React, { useEffect, useRef } from 'react';
import AutoSuggest from 'env-autosuggest';
import { useSelector } from 'react-redux';

export default function GenericTableAutoSuggest(props) {
    // Create a ref for the AutoSuggest component
    const genericAutoSuggestRef = useRef(null);

    // Example of extracting pathVars and params
    const pathVars = extractSubstringsAfterColon(props?.endpointContent?.data?.URL);
    const params = extractKeyValuePairs(props?.endpointContent?.data?.URL);

    console.log(params);

    // Apply fixSpanTags on the extracted values
    let path = pathVars.length > 0 ? fixSpanTags(pathVars[0]) : '';
    let par = params.length > 0 ? fixSpanTags(params[0]?.key?.html) : '';

    // UseEffect to update the innerHTML when the component mounts or the values change
    useEffect(() => {
        if (genericAutoSuggestRef.current) {
            genericAutoSuggestRef.current.innerHTML = par;
        }
    }, [par]);

    const { currentEnvironment } = useSelector((state) => {
        return {
            currentEnvironment: state?.environment?.environments[state?.environment?.currentEnvironmentId]?.variables || {},
        };
    });

    return (
        <div>
            <AutoSuggest
                contentEditableDivRef={genericAutoSuggestRef}
                suggestions={currentEnvironment}
                initial={'<span text-block="true"></span>'}
            />
        </div>
    );
}

    function extractKeyValuePairs(html) {
        let pairs = [];
        let inTag = false;
        let inTemplate = false;
        let currentKey = '';
        let currentValue = '';
        let startProcessing = false;
        let readingKey = true;
        let keyStartIndex = -1;
        let keyEndIndex = -1;
        let valueStartIndex = -1;
        let valueEndIndex = -1;

        for (let i = 0; i < html.length; i++) {
            let char = html[i];

            // Handle HTML tags
            if (char === '<') {
                inTag = true;
                if (startProcessing) {
                    if (readingKey) {
                        currentKey += char;
                    } else {
                        currentValue += char;
                    }
                }
                continue;
            } else if (char === '>') {
                inTag = false;
                if (startProcessing) {
                    if (readingKey) {
                        currentKey += char;
                    } else {
                        currentValue += char;
                    }
                }
                continue;
            }

            // Handle template {{xyz}}
            if (char === '{' && html[i + 1] === '{') {
                inTemplate = true;
            } else if (char === '}' && html[i - 1] === '}') {
                inTemplate = false;
            }

            if (inTag || inTemplate) {
                if (startProcessing) {
                    if (readingKey) {
                        currentKey += char;
                    } else {
                        currentValue += char;
                    }
                }
                continue;
            }

            // Start processing after the first '?'
            if (char === '?' && !startProcessing) {
                keyStartIndex = i + 1;
                startProcessing = true;
                continue;
            }

            // Handle '=' and '&' when processing
            if (startProcessing) {
                if (char === '=' && readingKey) {
                    keyEndIndex = i;
                    valueStartIndex = i + 1;
                    readingKey = false;
                    continue;
                }

                if (char === '&' && !readingKey) {
                    valueEndIndex = i - 1;
                    if (currentKey.trim().startsWith('amp;')) {
                        currentKey = currentKey.trim().replace('amp;', '');
                    }
                    pairs.push({
                        key: {
                            html: currentKey.trim(),
                            startIndex: keyStartIndex,
                            endIndex: keyEndIndex
                        },
                        value: {
                            html: currentValue.trim(),
                            startIndex: valueStartIndex,
                            endIndex: valueEndIndex
                        }
                    });
                    keyStartIndex = i + 1;
                    currentKey = '';
                    currentValue = '';
                    readingKey = true;
                    continue;
                }

                if (readingKey) {
                    currentKey += char;
                } else {
                    currentValue += char;
                }
            }
        }

        // Add the last key-value pair if any
        if (currentKey.trim() || currentValue.trim()) {
            if (currentKey.trim().startsWith('amp;')) {
                currentKey = currentKey.trim().replace('amp;', '');
            }
            valueEndIndex = html.length - 1;
            pairs.push({
                key: {
                    html: currentKey.trim(),
                    startIndex: keyStartIndex,
                    endIndex: keyEndIndex
                },
                value: {
                    html: currentValue.trim(),
                    startIndex: valueStartIndex,
                    endIndex: valueEndIndex
                }
            });
        }

        return pairs;
    }

    function extractSubstringsAfterColon(html) {
        let finalValue = [];
        let str = '';
        let inTag = false;
        let inTemplate = false;
        let c1 = 0;

        for (let i = 0; i < html.length; i++) {
            let char = html[i];

            // Handle HTML tags
            if (char === '<') {
                inTag = true;
            } else if (char === '>') {
                inTag = false;
            }

            // Handle template {{xyz}}
            if (char === '{' && html[i + 1] === '{') {
                inTemplate = true;
            } else if (char === '}' && html[i - 1] === '}') {
                inTemplate = false;
            }

            // Start collecting after "/:"
            if (char === ':' && html[i - 1] === '/' && c1 === 0) {
                c1++;
                continue;
            }

            // Collect characters for the current substring
            if (c1 !== 0) {
                str += char;
            }

            // Stop collecting and push the substring to the array
            if (c1 !== 0 && (html[i] === '/' || html[i] === '?' || i === html.length - 1)) {
                if (inTag || inTemplate) {
                    continue; // If within tag/template, continue collecting
                } else {
                    if (i === html.length - 1 && char !== '/' && char !== '?') {
                        str += char; // Include the last character if it's not a delimiter
                    }
                    // Trim the extra characters that are not part of the content
                    if (html[i] === '/' || html[i] === '?' || html[i] === '>') {
                        str = str.slice(0, -1);
                    }
                    c1 = 0;
                    finalValue.push(str.trim());
                    str = ''; // Reset str after pushing to finalValue
                }
            }
        }

        // Handle the case where the last substring doesn't end with a '/'
        if (str) {
            finalValue.push(str.trim());
        }

        return finalValue;
    }
    function fixSpanTags(html) {
        if (html.startsWith('</span>')) {
            html = html.slice(7); // Remove the first 7 characters
        }
        if (html.startsWith("<span text-block='true'>")) {
            html = html.slice(24); // Remove the first 24 characters
        } else if (html.startsWith("<span variable-block='true'>")) {
            html = html.slice(29); // Remove the first 29 characters
        } else if (html.startsWith('<span>')) {
            html = html.slice(6); // Remove the first 6 characters
        }
        if (html.endsWith('<span>')) {
            html = html.slice(0, -6); // Remove the last 6 characters
        } else if (html.endsWith("<span text-block='true'>")) {
            html = html.slice(0, -24); // Remove the last 24 characters
        } else if (html.endsWith("<span variable-block='true'>")) {
            html = html.slice(0, -29); // Remove the last 29 characters
        }
        let spanAttribute = html.trim().startsWith('{{') ? "variable-block='true'" : "text-block='true'";
        if (!html.startsWith('<span')) {
            html = `<span ${spanAttribute}>` + html;
        }
        if (!html.endsWith('</span>')) {
            html = html + '</span>';
        }
        return html;
    }