// set initial states
export const initialState = {
    active: false
};

export const initialCustomPopupState = {
    active: false,
    payload: {
        title: "Warning",
        message: "Something went wrong... Try again later!"
    }
};

// export reducer
export const reducer = (state, action) => {
    // switch case for the actions
    switch (action.type) {
        // CustomPopup cases
        case "toggle-popup":
            return {
                ...state,
                active: !state.active
            };

        case "SHOW_POPUP":
            return {
                ...state,
                active: true,
                payload: {
                    title: action.payload.title,
                    message: action.payload.message
                }
            };

        // default case, just break the switch
        default:
            break;
    };

    return state;
};