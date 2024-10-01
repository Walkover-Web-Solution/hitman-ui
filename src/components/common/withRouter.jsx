import React from 'react';
import { useRouter } from 'next/navigation';

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        const router = useRouter();
        const location = {
            pathname: router.pathname,
            query: router.query,
            asPath: router.asPath,
        };
        const params = router.query;

        return (
            <Component
                {...props}
                router={router}
                location={location}
                params={params}
            />
        );
    }

    return ComponentWithRouterProp;
}

export default withRouter;