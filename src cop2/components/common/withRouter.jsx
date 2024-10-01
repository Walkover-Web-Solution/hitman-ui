import React from 'react';
import { useRouter,  useParams } from 'next/navigation';

function withRouter(Component) {
    return (props) => {
        const router = useRouter();
        const navigate = router.push;
        const location = { pathname: router.pathname, query: router.query };
        const params = useParams();
        return <Component {...props} navigate={navigate} location={location} params={params} />;
    }
}

export default withRouter;