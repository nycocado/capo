'use client';

import {CookiesProvider} from 'react-cookie';
import React from "react";

export default function ClientCookiesProvider({children}: { children: React.ReactNode }) {
    return <CookiesProvider>{children}</CookiesProvider>;
}