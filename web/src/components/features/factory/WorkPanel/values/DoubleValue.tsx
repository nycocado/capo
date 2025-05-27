import React from 'react';
import {DoubleValueProps} from './DoubleValue.types';

export function DoubleValue({label, primaryValue, primaryTag, secondaryValue, secondaryTag}: DoubleValueProps) {
    const displayPrimaryTag = primaryValue != '\u00A0' && primaryTag ? primaryTag : '';
    const displaySecondaryTag = secondaryValue != '\u00A0' && secondaryTag ? secondaryTag : '';
    return (
        <>
            <h5 className="opacity-75">{label}</h5>
            <div>
                <h2 className="me-2 d-inline">
                    {primaryValue}
                    <small className="ms-1 fs-6">{displayPrimaryTag}</small>
                </h2>
                <h2 className="d-inline ms-3">
                    {secondaryValue}
                    <small className="ms-1 fs-6">{displaySecondaryTag}</small>
                </h2>
            </div>
        </>
    );
}

