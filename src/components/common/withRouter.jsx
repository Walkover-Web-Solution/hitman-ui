import { useNavigate, useLocation, useParams } from 'react-router-dom';

function withRouter(Component) {
    function ComponentWithRouterProps(props) {
        let navigate = useNavigate();
        let location = useLocation();
        let params = useParams();
        return <Component {...props} navigate={navigate} location={location} params={params} />;
    }

    return ComponentWithRouterProps;
}

export default withRouter;