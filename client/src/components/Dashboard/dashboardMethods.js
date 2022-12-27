import Axios from 'axios';

Axios.defaults.withCredentials = true;

export const handleClickOutsideProfileDropdown = (e, profileDropdownOpen) => {
    // if profileDropdownOpen is undefined, return and log error
    if (profileDropdownOpen && !e.target.closest('.profile')) {
        handleProfileDropdown();
    }
}

export const handleProfileDropdown = (profileDropdownOpen, setProfileDropdownOpen) => {
    // if profileDropdownOpen is undefined, return and log error
    if (!setProfileDropdownOpen) {
        return console.log("Could not toggle profile dropdown because profileDropdownOpen is undefined.");
    }

    // set profile dropdown open to opposite of current value
    setProfileDropdownOpen(!profileDropdownOpen);
}

export const handleProfileDropdownItemClick = (destination, setProfileDropdownOpen, navigate) => {
    // if navigate is undefined, return
    if (!navigate) {
        return console.log("Could not navigate to '" + destination + "' because navigate() is undefined.");
    }

    // if setProfileDropdownOpen is undefined, return and log error
    if (!setProfileDropdownOpen) {
        return console.log("Could not close profile dropdown because setProfileDropdownOpen is undefined.");
    }

    // close profile dropdown
    setProfileDropdownOpen(false);

    // navigate to profile page
    if (destination === "profile") {
        return navigate('/dashboard/profile');
    }
}

export const handleNavigationClick = (destination, navigate) => {
    // if navigate is undefined, return
    if (!navigate) {
        return console.log("Could not navigate to '" + destination + "' because navigate() is undefined.");
    }

    // handle navigation click and navigate to appropriate page
    if (destination === "home" || destination === "dashboard" || destination === null || destination === undefined) {
        return navigate('/dashboard');
    }
    else if (destination === "calendar") {
        return navigate('/dashboard/calendar');
    }
    else if (destination === "users") {
        return navigate('/dashboard/users');
    }
}

export const handleLogout = (navigate) => {
    // if navigate is undefined, return
    if (!navigate) {
        return console.log("Could not navigate to '/' because navigate() is undefined.");
    }
    
    // send logout request to server
    Axios.post('http://localhost:3001/api/post/logout').then((response) => {
        if (response.data.status) {
            return navigate('/');
        }
    }).catch((err) => {
        console.log(err);
    });
}