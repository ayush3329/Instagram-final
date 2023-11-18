import './styles.css'
import React, { useEffect, useState } from 'react';
import NavBar from '../component/NavBar';
import { checkLoginStatusState, loginDetailRecoil } from '../Context/InstagramContext';
import { IoSettingsOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom';
import { HiMiniHeart } from 'react-icons/hi2';
import { FaComment } from 'react-icons/fa';
import SmallLoader from '../component/SmallLoader';
import { LiaGreaterThanSolid, LiaLessThanSolid } from 'react-icons/lia';
import { RxCross2 } from 'react-icons/rx';
import { useRecoilValue, useRecoilState } from 'recoil';
import { BsThreeDots } from 'react-icons/bs';

function ProfilePage() {
    const [bigProfile, setBigProfile] = useState(false);
    const [index, setIndex] = useState(0); //this state is used to for changing picture in big screen, (forward and backward)
    const [zeroPost, setZeroPost] = useState(false) //this state will tell us whether user have 0 posts or not
    const [opt, setopt] = useState(false) //if this is true, user will be shown the delete option component 
    const [loginDetail, setLoginDetail] = useRecoilState(loginDetailRecoil)
    const checkLoginStatus = useRecoilValue(checkLoginStatusState);


    const [totalPost, setTotalPost] = useState([]);
    const nav = useNavigate();
    var id = 0;
    async function check() {
        const res = await checkLoginStatus();
        if (res) {
            console.log("User Logged in");
        } else {
            nav('/')
        }
    }

    async function fetchMyUserDetail() {
        console.log("called");
        const databody = {
            fullname: localStorage.getItem('fullname')
        }
        var response = await fetch('http://127.0.0.1:1769/api/v1/getMyDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(databody),
        })
        response = await response.json();
        console.log("resep-> ",response);
        if(response.postURL.length===0){
            setZeroPost(true);
        }
        localStorage.setItem('postURLs', JSON.stringify(response.postURL));
        setTotalPost(response.postURL);
        localStorage.setItem('total_following', response.following)
        localStorage.setItem('total_followers', response.followers)
        localStorage.setItem('total_post', response.post)
        localStorage.setItem('bio', response.bio)
        localStorage.setItem('gender', response.gender)
        setLoginDetail((prev) => {
            return {
                username: localStorage.getItem('username'),
                fullname: localStorage.getItem('fullname'),
                profile: localStorage.getItem('profile'),
                following: response.following,
                followers: response.followers,
                post: response.post,
                bio: response.bio
            }
        })

    }

    useEffect(() => {
        console.log("Authetication and fetching");

        setLoginDetail((prev) => {
            return {
                username: localStorage.getItem('username'),
                fullname: localStorage.getItem('fullname'),
                profile: localStorage.getItem('profile'),
                following: localStorage.getItem('total_following'),
                followers: localStorage.getItem('total_followers'),
                post: localStorage.getItem('total_post'),
                bio: localStorage.getItem('bio')
            }
        })

        check();
        const arr = localStorage.getItem('postURLs');
        // console.log("ar-> ", arr, typeof(arr), arr.length);
        if (arr!==null && arr.length>2) {
            console.log("present", JSON.parse(localStorage.getItem('postURLs') || '{}') );
            const arr = JSON.parse(localStorage.getItem('postURLs') || '{}')
            if(arr.length===0){
                setZeroPost(true);
            }
            setTotalPost(JSON.parse(localStorage.getItem('postURLs') || '{}'));
            return;

        } else {
            console.log("Not present");
        }

        setZeroPost(false);

        fetchMyUserDetail();


    }, [])

    function DeepProfile() {
        console.log(loginDetail);
        nav('/setting')
    }

    function OpenBigPhoto(event, flag = false, val = 0) {
        if (flag) {
            console.log("switch in",index, val, index+val);
            setIndex(index + val); //whenever this function called for the first time, "index" variable will not contain
            // 0, it will contain index of "previous" or  "next" post 
            return;
        }
        console.log("id", event.target.id - 1);
        setIndex(event.target.id - 1);
                setBigProfile(true);
    }

    function Switch(event) {
        console.log("switch", event.target.id);
        if (event.target.id === "inc") {
            OpenBigPhoto(event, true, 1);
        } else {
            OpenBigPhoto(event, true, -1);
        }
    }

    function Options() {
        console.log("opton", opt);
        setopt(true)
    }

    async function DeletePost(){
        console.log("index-> ", index);
                const dataBody = { id: totalPost[index][2], user: loginDetail.username }
        var response = await fetch('http://127.0.0.1:1769/api/v1/deletePost',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataBody)
        })
        response = await response.json();
        console.log("delete reponse-> ", response); 
        if(response.success){
            var Update = [...totalPost];
            Update.splice(index, 1);
            console.log("update", Update);
            if(Update.length!==0){
                setTotalPost(Update);
            } else{
                setZeroPost(true);
                setTotalPost([]);
            }
            localStorage.setItem('postURLs', JSON.stringify(Update));
            localStorage.setItem('total_post', response.postCount);
            setLoginDetail((prev)=>{
                return({
                    ...prev,
                    post: response.postCount
                })
            })
        }
    }

    return (
        <div className="h-[100vh] w-[100vw] bg-black flex" >
            <NavBar />
            <div className='text-white relative  w-[86%] overflow-y-auto flex flex-col  pt-[2rem] pb-[2rem]  '>

                <div className=' w-[100%]  h-[20%] flex items-center justify-center pt-[1.5rem] pl-[2rem] '>

                    <div className='overflow-hidden h-[10rem] w-[10rem] rounded-full flex items-center justify-center mr-[5rem] '>
                        <img src={loginDetail.profile} alt="profile" className='object-cover-down h-[100%] w-[100%] scale-[1]' />
                    </div>
                    <div className=' text-white pt-[0.2rem] min-w-[10%] flex flex-col  h-[100%]'>
                        <div className='flex gap-[1rem]  justify-center items-center'>
                            <div className='text-white text-[1.2rem] opacity-60'>{loginDetail.username || ('Annonymous')}</div>
                            <button onClick={DeepProfile} className='border-[1px] border-solid border-black bg-white text-black rounded-lg h-[1.8rem] pt-[0.5rem] pl-[0.5rem] pr-[0.5rem] pb-[0.5rem] flex items-center justify-center w-[6rem]'>Edit profile</button>
                            <IoSettingsOutline className='text-white text-[1.5rem]' />
                        </div>
                        <div className='w-[100%] mt-[1rem] flex gap-[1.5rem]'>
                            <div className='text-white text-[1.1rem] font-light'><span className='font-semibold'>{loginDetail.post}</span> posts</div>
                            <div className='text-white text-[1.1rem] font-light'><span className='font-semibold'>{loginDetail.followers}</span> followers</div>
                            <div className='text-white text-[1.1rem] font-light'><span className='font-semibold '>{loginDetail.following}</span> following</div>
                        </div>
                        <div className='w-[100%] mt-[1rem] flex gap-[1.5rem]'>
                            <div>{loginDetail.fullname || ('Annonymous')} </div>
                            {
                                loginDetail.bio !== undefined ? (<div className='text-green-500 font-bold'>{loginDetail.bio}</div>) : (<div></div>)
                            }
                        </div>
                    </div>
                </div>

                <div className=' relative top-[3rem] pl-[5rem] w-[100%] min-h-[60%]'>

                    <div className={`min-h-[100%] w-[95%] flex relative gap-[1rem]  pb-[2rem] pt-[0.5rem] flex-wrap items-center pr-[0.5rem] ${totalPost.length !== 0 && ('pl-[8rem]')} `}>

                        {
                            zeroPost ?  (<div className='text-white text-[1.5rem] text-opacity-60  w-[100%] relative top-[-2rem] pl-[30rem]'>No posts</div>) : 
                            (totalPost.length === 0 ? (<SmallLoader />) : (totalPost.map((indi) => {
                                id++;
                                return (<div key={id} className='bg-green rounded-lg relative h-[18rem] w-[18rem] overflow-hidden hover:cursor-pointer'>
                                    <div id={id} className='parent absolute h-[100%] gap-[2rem] flex justify-center z-[2]  items-center w-[100%] hover:bg-[rgba(0,0,0,0.6)] hover:backdrop-blur-[3px]'
                                        onClick={OpenBigPhoto}>
                                        <div className='flex icon  opacity-0 gap-[3px]'>
                                            <HiMiniHeart className=' text-white text-[1.5rem]'></ HiMiniHeart>
                                            <div className='text-white '>{indi[1]}</div>
                                        </div>
                                        <div className='flex icon  opacity-0 gap-[3px]'>
                                            <FaComment className='text-white text-[1.5rem]' />
                                            <div className='text-white '>39</div>
                                        </div>
                                    </div>
                                    <img src={indi[0]} alt="pic" className='relative z-[0] h-[100%] w-[100%]' />
                                </div>)
                            })))
                        }
                    </div>


                </div>

            </div>



            {bigProfile && totalPost.length>0 &&
                <div className='flex items-center justify-center z-[10] absolute bg-[rgba(0,0,0,0.6)] backdrop-blur-[1px] h-[100%] w-[100%]' >
                    <div className='h-[90%] w-[40%]'> <img src={totalPost[index][0]} alt="" className='h-[100%] w-[100%]' /> </div>


                    <div className='h-[90%] w-[30%] bg-black text-white pt-[1rem] '>
                        <div className='flex justify-between items-center'>
                            <div>
                                <div className='relative left-[1rem] h-[3rem] w-[3rem] rounded-full overflow-hidden'> <img src={loginDetail.profile} alt="pic" className='h-[100%] w-[100%] ' /> </div>
                            </div>
                            <BsThreeDots className='text-white relative right-[1rem] hover: cursor-pointer' onClick={Options} />

                        </div>
                    </div>




                    <RxCross2 className='text-white text-[2rem] absolute top-[1rem] left-[90rem] hover:text-red-500 hover:cursor-pointer' onClick={() => { setBigProfile(false) }} />

                    <div id="inc" onClick={Switch} className={`hover:bg-[rgba(255,255,255,.6)] ${index === totalPost.length - 1 && ('hidden')} right-[4.2rem] hover:cursor-pointer  absolute h-[2rem] w-[2rem] rounded-full bg-white flex items-center justify-center`}>
                        <LiaGreaterThanSolid id="inc" className=' text-red-400 text-[1.5rem] ' /> </div>

                    <div id="dec" onClick={Switch} className={`hover:bg-[rgba(255,255,255,.6)] ${index === 0 && ('hidden')} left-[3rem] hover:cursor-pointer absolute h-[2rem] w-[2rem] rounded-full bg-white flex items-center justify-center`}>
                        <LiaLessThanSolid id="dec" className='text-black text-[1.5rem] relative left-[-1.5px]' /> </div>
            </div>
            }

            {opt &&
                <div className='z-[10] flex absolute items-center justify-center h-[100%]  w-[100%] bg-[rgba(0,0,0,0.6)] backdrop:blur-[3px]' onClick={() => { setopt(false) }}>
                    <div className='h-[23rem] w-[27rem] bg-[rgba(33,33,33,1.0)] rounded-xl flex flex-col'>
                        <div className='h-[14%] border-b-[0.001rem] border-gray-700 w-[100%] text-red-500 hover:cursor-pointer font-medium flex items-center justify-center' onClick={DeletePost}>Delete</div> 
                        <div className='h-[14%] border-b-[0.001rem] border-gray-700 w-[100%] text-white hover:cursor-pointer flex items-center justify-center'>Edit</div> 
                        <div className='h-[14%] border-b-[0.001rem] border-gray-700 w-[100%] text-white hover:cursor-pointer flex items-center justify-center'>Hide like count</div> 
                        <div className='h-[14%] border-b-[0.001rem] border-gray-700 w-[100%] text-white hover:cursor-pointer flex items-center justify-center'>Turn off commenting</div> 
                        <div className='h-[14%] border-b-[0.001rem] border-gray-700 w-[100%] text-white hover:cursor-pointer flex items-center justify-center'>Go to post</div> 
                        <div className='h-[14%] border-b-[0.001rem] border-gray-700 w-[100%] text-white hover:cursor-pointer flex items-center justify-center'>About this account</div> 
                        <div className='h-[14%]  w-[100%] text-white flex hover:cursor-pointer items-center justify-center' onClick={() => { setopt(false) }}>cancel</div> 
                    </div>
             </div >}



        </div>
    )
}

export default ProfilePage;