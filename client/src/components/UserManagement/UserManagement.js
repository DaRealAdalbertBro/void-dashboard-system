import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

// import icons
import { BiRightArrow, BiLeftArrow } from "react-icons/bi";

// import components and utils
import { LoadingCircle } from "../LoadingCircle"
import { permissionLevelToString, Paginator } from "../../utils/utils";

// import css
import './UserManagement.css'
import { averageColorToLighterGradient } from "./userManagementMethods";
import { defaultProfilePicture } from "../globalVariables";

const UserManagement = () => {
    const [canUseLeftArrow, setCanUseLeftArrow] = useState(false);
    const [canUseRightArrow, setCanUseRightArrow] = useState(false);
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [userList, setUserList] = useState(null);
    const [searchList, setSearchList] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const maxItemsPerPage = 9;

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        Axios.post("http://localhost:3001/api/post/fetchUserList", {
            signal: controller.signal
        }).then(response => {
            setIsPending(false)
            // check response status
            if (response.data.status) {
                // if there was no error, set the user list data
                setUserList(response.data.data);

                // check if there is more than one page
                if (Math.ceil(response.data.data.length / maxItemsPerPage) > 1) {
                    setCanUseRightArrow(true);
                }

                if (response.data.data.length === 0) {
                    return setError("No users found");
                }

                return;
            }

            // if there was an error, return it
            return setError(response.data.message);
        }).catch(error => {
            setIsPending(false);
            return setError(error.message);
        });
    }, []);

    // handle the arrow click
    const handleArrowClick = (direction) => {
        // Check direction and if the arrow can be used
        if (direction === "left" && canUseLeftArrow) {
            // if the current page is greater than 1, set the current page to the previous page
            if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
        else if (direction === "right" && canUseRightArrow) {
            // if the current page is less than the max page, set the current page to the next page
            if (currentPage < Math.ceil(searchList.length / maxItemsPerPage)) {
                setCurrentPage(currentPage + 1);
            }
        }
    }

    // handle the search bar input
    const handleSearch = (e) => {
        // get the search value
        const searchValue = e.target.value;

        // if the search value is empty, set the search list to the user list
        if (searchValue === "") {
            setSearchList(userList);
            return;
        }

        // Filter the user list
        const filteredList = userList.filter(user => {
            return user.user_name.toLowerCase().includes(searchValue.toLowerCase());
        });

        // Store the filtered list to the search list
        setSearchList(filteredList);
    }

    // handle the user arrow click
    useEffect(() => {
        // if there is no user list, return
        if (userList === null) {
            return;
        }

        // if there is no search list, set the user list as the search list
        if (searchList === null) {
            setSearchList(userList);
        }

        // handle the left and right arrows usability
        if (currentPage === 1) {
            setCanUseLeftArrow(false);
        }
        else {
            setCanUseLeftArrow(true);
        }

        if (currentPage === Math.ceil((searchList || userList).length / maxItemsPerPage)) {
            setCanUseRightArrow(false);
        }
        else {
            setCanUseRightArrow(true);
        }
    }, [currentPage, userList, searchList]);


    return (
        <div className="container full flex flex-column">
            <div className="search-bar">
                <input type="text" placeholder="Search &#x1F50E;&#xFE0E;" onChange={(e) => handleSearch(e)} />
            </div>
            {isPending && <LoadingCircle />}
            <div className="list-wrapper">

                <div className={`left-arrow ${canUseLeftArrow ? '' : 'disabled'}`} onClick={() => handleArrowClick("left")}>
                    <BiLeftArrow />
                </div>

                {/* USER LIST TABLE */}
                <div id="user-management">

                    <div className="wrapper">
                        {error && <p className="error">{error}</p>}

                        {!error && userList && searchList &&
                            Paginator(searchList, currentPage, maxItemsPerPage).data.map((user, key) => {
                                return <UserBox key={key} user={user} navigate={navigate} />
                            })
                        }
                    </div>
                </div>

                {/* RIGHT ARROW */}
                <div className={`right-arrow ${canUseRightArrow ? '' : 'disabled'}`} onClick={() => handleArrowClick("right")} >
                    <BiRightArrow />
                </div>


            </div>

        </div>
    )
};

const UserBox = ({ user, navigate }) => {
    return (
        <div className="box flex center">

            <div className="gradient" onClick={() => {
                return navigate("/dashboard/profile/" + user.user_id);
            }} style={{ "backgroundImage": averageColorToLighterGradient(user.user_banner_color) }} />

            <div className="flex-column flex center">
                <div className="avatar">
                    <img src={user.user_avatar_url || defaultProfilePicture} alt="" />
                </div>
            </div>

            <div className="flex-column">
                <div className="flex-column">
                    <div className="heading flex flex-column">
                        <h3 className="user-name">{user.user_name}<span className="user-tag">#{user.user_tag}</span></h3>
                        <p className="email">{user.user_email}</p>

                        <div className="sub-component">
                            <p className="id"><span className="darker">ID:</span> {user.user_id}</p>
                            <p className="role"><span className="darker">Role:</span>{permissionLevelToString(user.user_permissions)}</p>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
};

export default UserManagement;