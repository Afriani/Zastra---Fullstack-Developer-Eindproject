import {Link} from 'react-router-dom';

function Private() {
    return (
        <div className="nav-menu">
            <Link to="/privacy">Privacy</Link>
        </div>
    );
}

export default Private;