// import icons
import { IoWarningOutline } from 'react-icons/io5';

export const CustomPopup = ({ title, message, setActive }) => {
    // close popup
    const closeHandler = (e) => {
        // play close animation
        e.currentTarget.parentElement.parentElement.parentElement.classList.add('hidden');
        e.currentTarget.parentElement.parentElement.parentElement.parentElement.classList.add('hidden');

        // remove popup after animation
        setTimeout(() => {
            setActive(false);
        }, 210);
    }

    return (
        <div className="popup-container">
            <div className="popup-box">
                <div className="popup-heading-icon">
                    <IoWarningOutline />
                </div>

                <div className="popup-content">
                    <div className="popup-header">
                        <h2>{title}</h2>
                    </div>

                    <div className="popup-body">
                        <p>{message}</p>

                    </div>

                    <div className="popup-footer">
                        <div className="footer-spacer"></div>
                        <button onClick={(e) => closeHandler(e)}>dismiss</button>
                    </div>

                </div>
            </div>

        </div>
    );
}

export const UpdateCustomPopup = (active, title, message) => {
    active[1](!active[0]);
    title[1](title[0]);
    message[1](message[0]);
}