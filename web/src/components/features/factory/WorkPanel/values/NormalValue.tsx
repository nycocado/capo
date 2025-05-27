import React from 'react';
import {NormalValueProps} from './NormalValue.types';

export function NormalValue({label, value}: NormalValueProps) {
    return (
        <>
            <h5 className="opacity-75">{label}</h5>
            <h2>{value}</h2>
        </>
    );
}

