import React, { useEffect } from 'react';
import { IoHome, IoTimerOutline } from 'react-icons/io5'
import { BsSearch, BsCameraReels, BsBookmark, BsMoon, BsInstagram } from 'react-icons/bs'
import { AiOutlineCompass, AiOutlineHeart } from 'react-icons/ai'
import { RiMessengerLine, RiSettings4Line } from 'react-icons/ri'
import { TbSquareRoundedPlus } from 'react-icons/tb'
import { HiOutlineBars4 } from 'react-icons/hi2'
import { BiCommentError } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createSectionState, loaderState, loginDetailRecoil, showOnlyLogo, webSocketRef } from '../Context/InstagramContext'
import { RxCross2 } from 'react-icons/rx'
import { TbPhotoBolt } from 'react-icons/tb'
import { LuImage } from 'react-icons/lu'
import { toast } from 'react-hot-toast';
import Loader from './Loader';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import { loginDetailType } from '@ayush/ui/dest/ContextTypes';
import ProgressBar from './ProgressBar';
import insta from '../Assets/InstagramLOGO.png'


function NavBar() {

    const nav = useNavigate();
    const [settingBar, setSettingBar] = useState(false);
    const setLoginDetail = useSetRecoilState(loginDetailRecoil)
    const [showIcon, setShowIcon] = useRecoilState(showOnlyLogo);
    const loginDetail = useRecoilValue(loginDetailRecoil)
    const showCreateSection = useRecoilValue(createSectionState);
    const setCreateSection = useSetRecoilState(createSectionState)
    const setShowLoader = useSetRecoilState(loaderState);
    const showLoader = useRecoilValue(loaderState);
    const [rs, setRS] = useRecoilState(webSocketRef);

    useEffect(() => {
        console.log("NavBar UseEffect", showIcon);
        if (rs != null) {
            rs.close();
            setRS(null);
        }
        setLoginDetail((prev: loginDetailType) => {
            return {
                ...prev,
                profile: localStorage.getItem("profile") || ''
            }
        })
    }, [])

    function ShowSettingCompo() {
        if (settingBar) {
            setSettingBar(false);
        }
        else {
            setSettingBar(true);
        }
    }

    function OpenPages(event: React.MouseEvent<SVGElement, MouseEvent> | React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        if (showCreateSection === true) {
            setCreateSection(false)
        }
        if (event.currentTarget.id === "message") {
            console.log("message route", showIcon);
        } else {
            setShowIcon(false);
        }
        console.log("route-> ", event.target);
        nav(`/${event.currentTarget.id}`)
    }

    function handleLogout() {
        console.log("logout");
    }


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setShowLoader(true);
        console.log("Post Started Uploading");
        const file = event.currentTarget.files?.[0];
        const formData = new FormData();

        if (!localStorage.getItem('username') && !file) {
            return;
        }

        formData.append('username', localStorage.getItem('username') || '');
        formData.append("post", file || '');

        try {
            const response = await fetch("http://127.0.0.1:1769/api/v1/post_upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Upload Completed", data);
            if (data.success) {
                toast.success('Posted Successfully');
                setTimeout(() => {
                    window.location.reload();
                }, 2000)
            } else {
                toast.dismiss();
                toast.error("Unable to post")
            }
            setCreateSection(false);

        } catch (error) {
            console.error("Error uploading profile photo:", error);
        }
        setShowLoader(false);
    }

    // const insta = "https://www.pngkey.com/png/full/828-8286178_mackeys-work-needs-no-elaborate-presentation-or-distracting.png";

    return (
            

            <nav className={`border-r-[1px] border-[rgba(97,97,97,1.0)] border-solid relative  h-[98%]  ${showIcon ? ('w-[5%]') : ('w-[14%]')} bg-black flex pl-[0.7rem] pr-[0.7rem] pt-[2.3rem] flex-col gap-[0.55rem]`} >
                
                <div className='hover:cursor-pointer  w-[100%] flex items-center pl-[1rem] mb-[1.5rem] '>
                    {showIcon ? (<BsInstagram className='text-[1.5rem] text-white' />) :
                        (<img src={insta} alt="Instagram" className='h-[1.7rem]' />)}
                </div>

                <div className='overflow-hidden relative navBlock hover:cursor-pointer h-[2.7rem] w-[100%]  rounded-lg flex  items-center  gap-[0.8rem]  hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>

                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>
                        <IoHome onClick={OpenPages} id="HomePage" className='icon text-white text-[1.4rem] opacity-90 ' /> {!showIcon && <span onClick={OpenPages} id="HomePage" className='text-white text-[1rem]'>Home</span>}
                    </div>

                    <div id="HomePage" onClick={OpenPages} className=' h-[100%] w-[100%] absolute '></div>
                </div>

                <div onClick={OpenPages} id="Search" className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>
                        <BsSearch id="Search" onClick={OpenPages} className='icon text-white text-[1.4rem] opacity-90' /> {!showIcon && <span onClick={OpenPages} id="Search" className='text-white text-[1rem]'>Search</span>}
                    </div>
                    <div id="Search" onClick={OpenPages} className=' h-[100%] w-[100%] absolute'></div>

                </div>

                <div className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>

                        <AiOutlineCompass className='icon text-white text-[1.4rem] opacity-90' /> {!showIcon && <span className='text-white text-[1rem]'>Explore</span>}
                    </div>
                    <div className=' h-[100%] w-[100%] absolute'></div>


                </div>

                <div className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>

                        <BsCameraReels className='icon text-white text-[1.4rem] opacity-90' /> {!showIcon && <span className='text-white text-[1rem]'>Reels</span>}
                    </div>
                    <div className=' h-[100%] w-[100%] absolute'></div>

                </div>

                <div className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>
                        <RiMessengerLine className='icon text-white text-[1.4rem] opacity-90' /> {!showIcon && <span className='text-white text-[1rem]'>Messages</span>}
                    </div>
                    <div id="message" onClick={OpenPages} className='h-[100%] w-[100%] absolute '></div>

                </div>

                <div onClick={OpenPages} id="notification" className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>

                        <AiOutlineHeart onClick={OpenPages} id="notification" className='icon text-white text-[1.4rem] opacity-90' /> {!showIcon && <span onClick={OpenPages} id="notification" className='text-white text-[1rem]'>Notification</span>}
                    </div>
                    <div id="notification" onClick={OpenPages} className=' h-[100%] w-[100%] absolute'></div>

                </div>

                <div onClick={() => { console.log("Create Clicked", showCreateSection); setCreateSection(!showCreateSection) }} className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>

                        <TbSquareRoundedPlus onClick={() => { console.log("Create Clicked", showCreateSection); setCreateSection(!showCreateSection) }} className='icon text-white text-[1.4rem] opacity-90 ' /> {!showIcon && <span className='text-white text-[1rem]'  >Create</span>}
                    </div>
                    <div className=' h-[100%] w-[100%] absolute '></div>

                </div>

                <div id="Profilepage" onClick={OpenPages} className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-lg flex items-center mb-[9.5rem]  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>

                        <div id="Profilepage" className='border-[1px] border-solid h-[1.5rem] w-[1.5rem] rounded-full overflow-hidden'> <img id="Profilepage" className='h-[100%] w-[100%]' src={loginDetail.profile} alt="" /> </div> {!showIcon && <span id="Profilepage" className='text-white text-[1rem] '>Profile</span>}
                    </div>
                    <div id="Profilepage" onClick={OpenPages} className=' h-[100%] w-[100%] absolute'></div>

                </div>

                <div onClick={ShowSettingCompo} className='overflow-hidden relative hover:cursor-pointer navBlock h-[2.7rem] w-[100%]  rounded-2xl flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[rgba(33,33,33,1.0)]'>
                    <div className='flex ml-[0.8rem] gap-[0.8rem]'>
                        <HiOutlineBars4 className='icon text-white text-[1.4rem] opacity-90 ' />  {!showIcon && <span className='text-white text-[1rem] '>More</span>}
                    </div>
                    <div className=' h-[100%] w-[100%] absolute'></div>

                </div>

                <div className={` pt-[0rem] items-center justify-center  ${!settingBar && ('z-[-1] right-80')} h-[23rem] hover:cursor-pointer w-[14.5rem] bg-[rgba(33,33,33,1.0)] ml-[0.2rem] absolute top-[18.3rem] rounded-lg flex flex-col`}>

                    <div className='hover:cursor-pointer navBlock h-[2.7rem] w-[95%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[#494747]'>
                        <RiSettings4Line className='icon text-white text-[1.2rem] opacity-90 ' /> <span className='text-white text-[0.92rem]'>Setting</span>
                    </div>
                    <div className='hover:cursor-pointer navBlock h-[2.7rem] w-[95%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[#494747]'>
                        <IoTimerOutline className='icon text-white text-[1.2rem] opacity-90 ' /> <span className='text-white text-[0.92rem]'>Your acitivity</span>
                    </div>
                    <div className='hover:cursor-pointer navBlock h-[2.7rem] w-[95%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[#494747]'>
                        <BsBookmark className='icon text-white text-[1.2rem] opacity-90 ' /> <span className='text-white text-[0.92rem]'>Saved</span>
                    </div>
                    <div className='hover:cursor-pointer navBlock h-[2.7rem] w-[95%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[#494747]'>
                        <BsMoon className=' icon text-white text-[1.2rem] opacity-90 ' /> <span className='text-white text-[0.92rem]'>Switch appearance</span>
                    </div>
                    <div className='hover:cursor-pointer navBlock h-[2.7rem] w-[95%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[#494747]'>
                        <BiCommentError className=' icon text-white text-[1.2rem] opacity-90 ' /> <span className='text-white text-[0.92rem] '>Report a problem</span>
                    </div>

                    <div className='mt-[0.4rem] h-[0.3rem] mr-[0rem] ml-[0rem] w-[100%] bg-[#363535] mb-[0.6rem]'></div>

                    <div className='hover:cursor-pointer navBlock h-[2.7rem] w-[95%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[#494747]'>
                        <span className='text-white text-[0.92rem] '>Switch account</span>
                    </div>

                    <div className='mt-[0.4rem] h-[0.1rem] mr-[0rem] ml-[0rem] w-[100%] bg-[#363535] mb-[0.6rem]'></div>

                    <div className='hover:cursor-pointer navBlock h-[2.7rem] w-[95%]  rounded-lg flex items-center  gap-[0.5rem] hover:duration-300 hover:bg-[#494747]'>
                        <span onClick={handleLogout} className='text-white text-[0.92rem]'>Log out</span>
                    </div>


                </div>

                <div className={`h-[100vh] w-[102vw] bg-[rgba(0,0,0,0.6)] backdrop-blur-[1px] absolute top-[-0.5rem] left-[-0.5rem] ${showCreateSection === true ? ('z-[10]') : ('z-[-1]')} `} onClick={() => { console.log("Create Clicked", showCreateSection); if (!showLoader) { setCreateSection(!showCreateSection) } }}>
                    <div className={`h-[30rem] rounded-3xl w-[30rem] bg-[rgba(33,33,33,1.0)] absolute left-[35rem] top-[8rem]`}>
                        <span className='text-[1.3rem] text-white top-[0.5rem] relative left-[9.8rem]'>Create a new Post</span>
                        <RxCross2 className='hover:cursor-pointer text-[1.5rem] relative top-[-1.3rem] left-[27rem] text-red-400' onClick={() => { if (showCreateSection === true) { console.log("set true"); setCreateSection(false) } }} />
                        <div className='relative'>
                            <TbPhotoBolt className=' text-[3rem] text-white absolute z-[2] top-[3.8rem] left-[12.5rem] -rotate-6' />
                            <LuImage className=' text-[3rem] text-white absolute z-[4] bg-[rgba(33,33,33,1.0)] top-[4.5rem] rotate-6 left-[14.5rem]' />
                        </div>
                        <div className='text-white relative top-[9rem] text-[1.5rem] left-[5.5rem]'>Drag photos and videos here</div>
                        <label htmlFor='post' className='text-white top-[11rem] left-[9rem] relative'>
                            <div className=' hover:cursor-pointer absolute bg-blue-500 text-white h-[2.5rem] w-[12rem] flex justify-center items-center rounded-lg ' >Select from computer</div>
                            {/* If i have created button instead of div then it won't work */}
                        </label>
                        <input type='file' id="post" className='hidden' onChange={handleFileUpload}></input>
                    </div>
                    {showLoader && <Loader />}
                </div>


            </nav>

    );
}

export default NavBar;