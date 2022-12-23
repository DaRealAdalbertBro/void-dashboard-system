import { IoWarningOutline } from 'react-icons/io5';

export const CustomPopup = ({ setShowPopup, title, message }) => {

    const closeHandler = (e) => {
        e.currentTarget.parentElement.parentElement.parentElement.classList.add('hidden');
        e.currentTarget.parentElement.parentElement.parentElement.parentElement.classList.add('hidden');

        setTimeout(() => {
            setShowPopup(false);
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