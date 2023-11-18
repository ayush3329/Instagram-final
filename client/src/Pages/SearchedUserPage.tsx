import React, {  useEffect, useState } from 'react';
import NavBar from '../component/NavBar';
import { AiOutlineDown, AiOutlineStar, AiOutlineUserAdd } from 'react-icons/ai'
import {  checkLoginStatusState, doIFollowThisGuyState, searchedUserState } from '../Context/InstagramContext';
import { BsChevronCompactDown } from 'react-icons/bs';
import {RxCross2} from 'react-icons/rx'
import { useNavigate } from 'react-router-dom';
import {  useRecoilValue,  useRecoilState } from 'recoil';

function SearchedUserPage(props) {    
    
    const [isfollowed, setFollwedStatus] = useState(false); //assuming logged in user does not follow this user
    var [searchedUser, setSearchedUser] = useRecoilState(searchedUserState)
    const checkLoginStatus = useRecoilValue(checkLoginStatusState)
    const [ doIFollowThisGuy, setdoIFollowThisGuy]  = useRecoilState(doIFollowThisGuyState) 

    const [closeWindow, setCloseWindow] = useState(false); //by default this window is closed
    const nav = useNavigate();
    const [isLoggedin, setIsloogedIn] = useState(false);
    useEffect(()=>{
        async function  check() {
            const res = await checkLoginStatus();
            if(res){
                setIsloogedIn(true);
            } else{
              localStorage.clear();
              nav('/')
            }
        }
        check();
    }, [])
    

    useEffect(()=>{

     async function runOnReload(){
        const form_Data = new FormData();
        form_Data.append('username', localStorage.getItem('Search_username'))
        form_Data.append('myUsername', localStorage.getItem('username'))
        var get_Detail_of_Searched_User = await fetch('http://127.0.0.1:1769/api/v1/getUserInfo', {
            method: "POST",
            body: form_Data
        });
        get_Detail_of_Searched_User = await get_Detail_of_Searched_User.json();
        setdoIFollowThisGuy(get_Detail_of_Searched_User.doIfollow);
        if(doIFollowThisGuy===false){
         setFollwedStatus(false);
        } else{
         setFollwedStatus(true);
        }
     }


     runOnReload();
    },[]);


    async function followUser(){
        
        const myUsername = localStorage.getItem('username');
        const wantToFollowUser = localStorage.getItem("Search_username");
        const dataBody = {myUsername: myUsername, wantToFollowUser: wantToFollowUser};

        let response = await fetch('http://127.0.0.1:1769/api/v1/followUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataBody),
        })

        setFollwedStatus(true);
        localStorage.removeItem('postURLs')

    }

    async function unfollow_user() {
        const myUsername = localStorage.getItem('username');
        const wantToUnfollowUser = localStorage.getItem("Search_username");
        const dataBody = {myUsername: myUsername, wantToUnfollowUser: wantToUnfollowUser};

        let response = await fetch('http://127.0.0.1:1769/api/v1/unfollowUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataBody),
        })
        
        setFollwedStatus(false);
        setCloseWindow(false);
        localStorage.removeItem('postURLs')
    }


    function CloseWindow(event){
        if(closeWindow){
            setCloseWindow(false);

        } else{
            setCloseWindow(true);
        }
    } 


    useEffect(() => {
        setSearchedUser((prev) => {
            return {
                ...prev,
                username: localStorage.getItem("Search_username"),
                fullname: localStorage.getItem("Search_fullname"),
                profile: localStorage.getItem("Search_profile"),
            }
        })
    }, [])

    return (
        <div className="h-[100vh] w-[100vw] bg-black flex overflow-hidden" >
            <NavBar />
            <div className='text-white relative w-[86%] overflow-y-scroll flex pt-[2rem] justify-center' >

                <div className='w-[60%] h-[20%] flex items-center pt-[1.5rem] pl-[10rem]'>
                    <div className='overflow-hidden border-red border-[1px] border-solid h-[10rem] w-[10rem] rounded-full flex items-center justify-center mr-[5rem] '>
                        <img src={searchedUser.profile} alt="profile" className='object-cover-down h-[100%] w-[100%] scale-[1]' />
                    </div>
                    <div className=' text-white pt-[0.2rem] min-w-[10%] flex flex-col  h-[100%]'>
                        <div className='flex gap-[1rem] '>
                            <div className='text-white text-[1.2rem] opacity-60'>{searchedUser.username || ('Annonymous')}</div>
                            {
                                (isfollowed === false) ? (<button className='h-[2rem] w-[5rem] bg-blue-600 rounded-lg' id="follow" onClick={followUser}>follow</button>) :
                                    (<button className='flex items-center justify-center gap-1 h-[2rem] w-[8.5rem] bg-white text-black rounded-lg' onClick={CloseWindow}>following
                                        <AiOutlineDown className='relative top-[5%] left-[3%]' /> </button>)
                            }

                            <button className='h-[2rem] w-[5.5rem] bg-white rounded-lg text-black'>Message</button>
                            <AiOutlineUserAdd />
                        </div>
                        <div className='w-[100%] mt-[1rem] flex gap-[1.5rem]'>
                            <div className='text-white text-[1.1rem] font-light'><span className='font-semibold'>{searchedUser.totalPost}</span> posts</div>
                            <div className='text-white text-[1.1rem] font-light'><span className='font-semibold'>{searchedUser.followers}</span> followers</div>
                            <div className='text-white text-[1.1rem] font-light'><span className='font-semibold'>{searchedUser.following}</span> following</div>
                        </div>
                        <div className='w-[100%] mt-[1rem] flex gap-[1.5rem]'>
                            <div>{searchedUser.fullname || ('Annonymous')} </div>
                            <div>{searchedUser.bio}</div>
                        </div>
                    </div>
                </div>


                <div className={` ${(closeWindow===true) ? ('opacity-100'): ('opacity-0')}`}>
                     <div className='pt-[1rem] flex flex-col items-center justify-center relative top-[7.7rem] right-[32rem] w-[25rem] border-white rounded-lg border-solid border-[1px] bg-[#1d1c1c]'>
                        <div className='mb-[0.5] overflow-hidden border-red border-[1px] border-solid h-[3rem] w-[3rem] rounded-full flex items-center justify-center '>
                            <img src={searchedUser.profile} alt="profile" className='object-cover-down h-[100%] w-[100%] scale-[1]' />
                        </div>
                            <RxCross2 className='hover:cursor-pointer text-[1.5rem] relative top-[-2.6rem] left-[10rem] text-white' onClick={CloseWindow}/>
                        <div className='mb-[1rem]'>{searchedUser.username}</div>
                        
                        <div className='w-[100%] flex items-center pl-[1rem] mt-[1rem] hover:cursor-pointer h-[3rem] hover:bg-[#494747]'>
                            <div>Add to close friend </div > 
                            <div className='relative left-[13rem]  h-[1.5rem] w-[1.5rem] rounded-full flex items-center justify-center border-[1px] border-solid border-white'>
                                <AiOutlineStar className='text-black' />
                            </div> 

                        </div>
                        <div className='w-[100%]  pl-[1rem] hover:cursor-pointer h-[3rem] hover:bg-[#494747] flex items-center mt-[1rem] mb-[1rem]' id="unfollow" onClick={unfollow_user}>Unfollow</div>
                        </div>
                </div> 
                

            </div>



        </div>
    );
}

export default SearchedUserPage;