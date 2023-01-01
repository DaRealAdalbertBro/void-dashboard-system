// Purpose: To display a 404 page when a user tries to access a page that does not exist

// import react components
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// import gif
import { NotFoundGif } from '../globalVariables';

// import css
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    // decide what to display
    let randomGifIndex = Math.floor(Math.random() * NotFoundGif.length);
    let randomGif = NotFoundGif[randomGifIndex];

    useEffect(() => {
        document.title = 'Page not found | Void';
    }, [navigate])

    return (
        <div className='not-found-container'>
            <img src={randomGif.url || '/assets/images/404_not_found.gif'} alt="" />

            <div className='not-found-text'>

                <h2>What are you looking for?</h2>
                <h2><span className='not-here'>This page isn't here.</span></h2>

                {randomGif.message}

                <button onClick={() => navigate('/dashboard/')}>Go to Home Page</button>
            </div>
        </div>
    );
};

export default NotFound;