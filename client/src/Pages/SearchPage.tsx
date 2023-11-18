import { useState, useEffect } from 'react';
import { checkLoginStatusState, doIFollowThisGuyState, loginDetailRecoil, searchedUserState } from '../Context/InstagramContext';
import NavBar from '../component/NavBar';
import { useNavigate } from 'react-router-dom';
import SmallLoader from '../component/SmallLoader'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { RxCross2 } from 'react-icons/rx';

function SearchPage() {
    var setLoginDetail = useSetRecoilState(loginDetailRecoil);
    const checkLoginStatus = useRecoilValue(checkLoginStatusState);
    const setSearchedUser = useSetRecoilState(searchedUserState);
    const setdoIFollowThisGuy = useSetRecoilState(doIFollowThisGuyState);
    const [showNothing, setShowNothing] = useState(false); //this usestate will not show the loader when user will clear its previously searched users histor, at this moment user doesn't searched anything


    const [remove_spinner, setRemoveSpinner] = useState(false); //is its value is true spinner will not appear
    const [allUser, setAllUser] = useState([]);
    const nav = useNavigate();
    const [newUsername, setUsername] = useState('');
    const [prev_data, set_prev_data] = useState(true); //if its value is true then "alluser" array contain data of previously searched user's

    async function check() {
        const res = await checkLoginStatus();
        if (res) {
            console.log("Valid cookie");
        } else {
            nav('/')
        }
    }

    async function previous_Searched_user() {
        const dataBody = { fullname: localStorage.getItem('fullname') };
        var response = await fetch('http://127.0.0.1:1769/api/v1/previous_Searched_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataBody)
        })
        response = await response.json();
        console.log("previous_Searched_user-> ", response.user);
        setAllUser(response.user);
        const helper = JSON.stringify(response.user);
        localStorage.setItem('prev_searches', helper);

    }

    useEffect(() => {
        check();
        //Below line of code will only be execcuted if user is logged in
        previous_Searched_user();
        const userName = localStorage.getItem("username")
        const passWord = localStorage.getItem("password")
        const fullName = localStorage.getItem("fullname")
        const Profile = localStorage.getItem("profile")
        setLoginDetail((prev) => {
            return {
                username: userName,
                password: passWord,
                profile: Profile,
                fullname: fullName
            }
        })

    }, [])


    async function SearchinDB(event) {
        setShowNothing(false);
        console.log("Hi->Hi->");
        //error in this function
        const username = event.target.value;
        if (username.length === 0) {
            console.log("empty");
            if (localStorage.getItem('prev_searches')) {
                // console.log("present", JSON.parse(localStorage.getItem('prev_searches') || '{}'));
                setAllUser(JSON.parse(localStorage.getItem('prev_searches') || '{}'));
                set_prev_data(true);
                setUsername('')
            }
            setUsername('');
            console.log("By->By->");
            return;
        }

        console.log("react username-> ", username);

        setUsername(username)
        console.log(username);
        if (!username) {
            setAllUser(null);
            console.log("By->By-> 89");
            return;
        }
        var response = await fetch(`http://127.0.0.1:1769/api/v1/search/${username}`, {
            method: 'POST',
            credentials: 'include'
        });
        response = await response.json();
        console.log("response ", response);
        if (!response.success) {
            setRemoveSpinner(true)
            setAllUser([]);
            console.log("By->By->", 106);
            return;
        }
        set_prev_data(false);
        console.log(response.user);
        console.log("By->By-> end", allUser.length);
        setAllUser(response.user);
    }

    function redirectToProfilePage() {
        nav("/Profilepage")
    }

    async function SearchedUser(event) {

        let dataBody = {
            username: "",
            myUsername: localStorage.getItem('username')
        };
        if (event.target.tagName === "DIV") {
            console.log("img", event.target.id);
            dataBody.username = event.target.id;
        } else {
            dataBody.username = event.target.innerText;
        }

        console.log("user to found", dataBody);


        const response = await fetch('http://127.0.0.1:1769/api/v1/getUserInfo', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataBody),
        })
        const data = await response.json();
        if (data.success === false) {
            return;
        }
        console.log("DATA", data);
        setSearchedUser(() => {
            return ({
                username: data.username,
                password: "",
                fullname: data.fullname,
                profile: data.profile
            })
        })

        localStorage.setItem("Search_username", data.username);
        localStorage.setItem("Search_fullname", data.fullname);
        localStorage.setItem("Search_profile", data.profile);


        var v1 = localStorage.getItem("Search_username"), v2 = localStorage.getItem("username");
        if (v1 == v2) {
            console.log("Eqaul");
            redirectToProfilePage();
            return;
        }
        setdoIFollowThisGuy(data.doIfollow);
        localStorage.setItem("doIFollowThisGuy", data.doIfollow);
        nav('/searchedUser')
    }

    async function ClearEntry(event){
        if(event.target.id==="clear"){
            setAllUser([]);
            localStorage.setItem('prev_searches', []);
            setShowNothing(true)

            return;
        }
        console.log("clear", allUser, event.target.id);
        var filterArray = allUser.filter(user=> user.username !== event.target.id)
        console.log("filter-> ", filterArray);
        if(filterArray.length===0){
            setShowNothing(true)
        }
        setAllUser(filterArray)
        filterArray = JSON.stringify(filterArray);
        localStorage.setItem('prev_searches', filterArray)
    }

    return (
        <div className="h-[100vh] w-[100vw] bg-black flex overflow-hidden" >
            <NavBar />
            <div className='w-[86%] min-h-[100%] flex flex-col overflow-x-hidden overflow-y-scroll pb-[10rem]' >

                {/*search Bar*/}
                <div className='pt-[4rem] flex  justify-center w-[100%] mb-[2rem]'>
                    <input value={newUsername} type='search' placeholder='Search' onChange={SearchinDB} className='text-white rounded-lg border-none  w-[70%] h-[2rem] bg-[rgba(33,33,33,1.0)] placeholder:text-white pl-[2rem]' ></input>
                </div>
                {/*search Bar*/}



                {allUser.length !== 0 && prev_data && <div id="clear" className='text-blue-600 relative left-[50rem] hover:text-white hover:cursor-pointer font-semibold' onClick={ClearEntry}>Clear all</div>}

                <div className={`  text-white flex flex-col ${allUser.length !== 0 && ('pl-[15rem]')}  gap-[2rem] pb-[2rem] pt-[2rem] w-[100%] min-h-[100%]`}>
                    {
                        !showNothing && 
                        allUser.length === 0 ?
                            (
                                // "allUser" array will be empty in only 2 codition
                                // 1-> User landed on the searchpage for the very first time and haven't started searching any other user
                                // 2-> User tried to search an account which does not exist
                                !remove_spinner ? (<SmallLoader />) : (<div className='flex justify-center items-center'> Invalid user </div>)
                            ) :
                            (
                                
                                allUser.map((single) => {
                                    // console.log("render-> ",single);
                                    return (
                                        <div id={single.username} key={single.username} className='flex justify-between w-[58%]  items-center ' >
                                            <div className='flex items-center gap-[1.5rem]'> 
                                            <div onClick={SearchedUser}  id={single.username} className='relative h-[3rem] w-[3rem] rounded-full border-solid border-[1px] border-black overflow-hidden hover:cursor-pointer'>
                                                <div id={single.username} className='h-[3rem] w-[3rem] absolute rounded-full hover:bg-[rgba(0,0,0,0.6)]'> </div> 

                                                <img src={single.profile} alt={single.username} id={single.username} className='h-[100%] w-[100%] object-cover hover:cursor-pointer' /> 
                                            </div>
                                            <div onClick={SearchedUser} className='hover:cursor-pointer hover:opacity-60'>{single.username}</div>
                                            </div>
                                            {newUsername.length===0 && <RxCross2 id={single.username} className=' text-white relative hover:cursor-pointer' onClick={ClearEntry}/>}
                                        </div>
                                    )
                                })
                            )
                    }
                </div>

            </div>
        </div>
    );
}

export default SearchPage;