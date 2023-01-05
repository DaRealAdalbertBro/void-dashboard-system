import Axios from 'axios';
import { apiServerIp } from '../globalVariables';

export const handleClickOutsideProfileDropdown = (e, setProfileDropdownOpen, profileDropdownOpen) => {
    // if profileDropdownOpen is closed, return
    if (!profileDropdownOpen) {
        return;
    }

    // if the target of the click is the profile dropdown button, return
    if (e.target.id === "profile-dropdown-button" || e.target.id === "dropdown-title" || e.target.matches("#dropdown-title *")) {
        return;
    }

    // if the target of the click is not the profile dropdown, close it
    if (!e.target.closest(".profile-dropdown")) {
        handleProfileDropdown(profileDropdownOpen, setProfileDropdownOpen);
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

    // navigate to destination
    return navigate(destination);
}

export const handleNavigationClick = (destination, navigate) => {
    // if navigate is undefined, return
    if (!navigate) {
        return console.log("Could not navigate to '" + destination + "' because navigate() is undefined.");
    }

    destination = destination.toLowerCase();

    // handle navigation click and navigate to appropriate page
    if (destination === "home" || destination === "dashboard" || destination === null || destination === undefined) {
        return navigate('/dashboard');
    }
    else if (destination === "calendar") {
        return navigate('/dashboard/calendar');
    }
    else if (destination === "usermanagement") {
        return navigate('/dashboard/users');
    }
}

export const handleLogout = (navigate) => {
    // if navigate is undefined, return
    if (!navigate) {
        return console.log("Could not navigate to '/login' because navigate() is undefined.");
    }

    // create abort controller
    const controller = new AbortController();

    // send logout request to server
    Axios.post(apiServerIp + '/api/post/logout', {
        signal: controller.signal,
    }).then((response) => {
        // if operation was successful, navigate to login page
        if (response.data.status) {
            return navigate('/login');
        }
    }).catch((err) => {
        if (err.name === "CanceledError") {
            return;
        }

        console.log(err);
    });

    return () => controller.abort();
}

export const handleLeftSidebarToggle = (leftSidebarOpen, setLeftSidebarOpen) => {
    const leftSidebarDiv = document.querySelector(".dashboard-left-bar");
    
    // if leftSidebarOpen is undefined, return and log error
    if (!setLeftSidebarOpen || !leftSidebarDiv) {
        return console.log("Could not toggle left sidebar because leftSidebarOpen is undefined.");
    }
    
    const container = document.querySelector(".dashboard-container");
    const leftSidebarTitle = document.querySelector(".dashboard-header-title");
    const leftSidebarTitleText = document.querySelector(".dashboard-header-title h1");
    const allButtons = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item");
    const allButtonTextItems = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item p");
    const allIcons = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item svg");
    const allTitleItems = document.querySelectorAll(".dashboard-left-bar .dashboard-left-bar-item-section h2");

    const duration = 200;

    leftSidebarTitle.animate([
        { padding: leftSidebarOpen ? "0 24px" : "0 17px", },
        { padding: leftSidebarOpen ? "0 17px" : "0 24px" },
    ], {
        duration: duration,
        easing: "ease-in-out",
        fill: "forwards"
    });

    leftSidebarTitleText.animate([
        { opacity: leftSidebarOpen ? "1" : "0" },
        { opacity: leftSidebarOpen ? "0" : "1" },
    ], {
        duration: duration,
        easing: "ease-in-out",
        fill: "forwards"
    });

    setTimeout(() => {
        // toggle left sidebar title visibility
        leftSidebarTitle.children[1].style.marginTop = leftSidebarOpen ? "4px" : "0";
        leftSidebarTitle.children[1].style.marginBottom = leftSidebarOpen ? "4px" : "0";
        leftSidebarTitleText.style.position = leftSidebarOpen ? "absolute" : "relative";
        leftSidebarTitleText.style.visibility = leftSidebarOpen ? "hidden" : "visible";
    }, duration / 2);


    // animate left sidebar and its elements
    allButtonTextItems.forEach((item) => {
        // animate button text
        item.animate([
            { opacity: leftSidebarOpen ? "1" : "0" },
            { opacity: leftSidebarOpen ? "0" : "1" },
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });

        setTimeout(() => {
            // toggle button text visibility
            item.style.position = leftSidebarOpen ? "absolute" : "relative";
            item.style.visibility = leftSidebarOpen ? "hidden" : "visible";
        }, duration / 2);
    });

    allButtons.forEach((item) => {
        // animate buttons
        item.animate([
            { padding: leftSidebarOpen ? "8px 16px" : "0 0 0 0", justifyContent: leftSidebarOpen ? "flex-start" : "center" },
            { padding: leftSidebarOpen ? "0 0 0 0" : "8px 16px", justifyContent: leftSidebarOpen ? "center" : "flex-start" },
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });
    });

    allIcons.forEach((item) => {
        // animate icons
        item.animate([
            { marginRight: leftSidebarOpen ? "8px" : "0" },
            { marginRight: leftSidebarOpen ? "0" : "8px" },
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });
    });

    allTitleItems.forEach((item) => {
        // animate title text
        item.animate([
            { justifyContent: leftSidebarOpen ? "flex-start" : "center" },
            { justifyContent: leftSidebarOpen ? "center" : "flex-start" },
        ], {
            duration: duration,
            easing: "ease-in-out",
            fill: "forwards"
        });

        // set text to first letter
        if (leftSidebarOpen)
        {
            // create new dataset to store text
            item.datasets = {};
            item.datasets.textData = item.innerText;
        }

        setTimeout(() => {
            item.innerText = leftSidebarOpen ? item.datasets.textData.slice(0, 3) : item.datasets.textData;
        }, duration / 2);


    });

    // animate left sidebar
    leftSidebarDiv.animate([
        { width: leftSidebarOpen ? "240px" : "56px" },
        { width: leftSidebarOpen ? "56px" : "240px" },
    ], {
        duration: duration,
        easing: "ease-in-out",
        fill: "forwards"
    });

    // animate container to match left sidebar
    container.animate([
        { gridTemplateColumns: leftSidebarOpen ? "240px" : "56px" },
        { gridTemplateColumns: leftSidebarOpen ? "56px" : "240px" },
    ], {
        duration: duration,
        easing: "ease-in-out",
        fill: "forwards"
    });


    // set left sidebar open to opposite of current value
    setLeftSidebarOpen(!leftSidebarOpen);
}