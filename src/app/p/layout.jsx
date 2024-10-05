import React from 'react';
import PublicEndpoint from '../../components/publicEndpoint/publicEndpoint'
import Providers from '../providers/providers';

export default async function Layout() {
    return (
        <div>
            <Providers>
                <PublicEndpoint />
            </Providers>
        </div>
    );
}