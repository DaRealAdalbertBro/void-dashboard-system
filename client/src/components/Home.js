import { useNavigate } from 'react-router-dom';

import "../css/Home.css"

const Home = () => {
    const navigate = useNavigate();
    
    return (
        <div className='home'>
            <h1>Home</h1>
        </div>
    )
}

export default Home;