import React from "react";
import NavBar from "./NavBar";
import { InstagramContext, checkLoginStatusState, loginDetailRecoil } from "../Context/InstagramContext";
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { BsMeta, BsShieldCheck } from "react-icons/bs";
import { IoPersonOutline } from "react-icons/io5";
import { RiAdvertisementLine } from "react-icons/ri";
import { toast } from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from "recoil";


function Settings() {
    const [changes, setChnages] = useState(false)
    const [details, setdetails] = useState({ bio: '', gender: '' });
    
    const [loginDetail, setLoginDetail ] = useRecoilState(loginDetailRecoil);
    const checkLoginStatus = useRecoilValue(checkLoginStatusState); 


    const nav = useNavigate();
    const [isLoggedin, setIsloogedIn] = useState(false);

    useEffect(() => {
        const BIO =  localStorage.getItem('bio');
        const GENDER = localStorage.getItem('gender')
        
        setdetails((prev)=>{
            return({
                bio: BIO,
                gender: GENDER
            })
        })

        async function check() {
            const res = await checkLoginStatus();
            if (res) {
                console.log("why not fun");
                setLoginDetail((prev) => {
                    return {
                        username: localStorage.getItem('username'),
                        fullname: localStorage.getItem('fullname'),
                        profile: localStorage.getItem('profile'),
                        following: localStorage.getItem('total_following'),
                        followers: localStorage.getItem('total_followers'),
                        post: localStorage.getItem('total_post')
                    }
                })
                setIsloogedIn(true);
            } else {
                localStorage.clear();
                nav('/')
            }
        }
        check();
    }, [])


    const handleFileUpload = async (event) => {
        event.preventDefault();
        console.log("fileupload");
        const file = event.target.files[0];
        // console.log(file);
        const formData = new FormData();
        formData.append('username', localStorage.getItem('username'));
        formData.append("profilePhoto", file);

        try {
            const response = await fetch("http://127.0.0.1:1769/api/v1/changeProfile", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            localStorage.setItem('profile', data.profilepic); //updating existing profile value
            // console.log(data);
            setLoginDetail((prev) => {
                return {
                    ...prev,
                    profile: data.profilepic
                }
            })

        } catch (error) {
            console.error("Error uploading profile photo:", error);
        }
    }

    function ActivateSubmitButton(event) {
        setChnages(true);
        setdetails((prev) => {
            return ({
                ...prev,
                [event.target.id]: event.target.value
            })
        })
    }
    function redirect(){
        nav('/Profilepage')
    }
    async function SubmitDetails(event){
        event.preventDefault();
        console.log("Submit Details");
        const dataBody= {
            username: localStorage.getItem('username'),
            bio: details.bio,
            gender: details.gender
        }
        var response = await fetch('http://127.0.0.1:1769/api/v1/Submit_Details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataBody)
        });
        
        response = await response.json();
        console.log("response ", response);
        if(response.success){
            toast.dismiss();
            toast.success('Profile successfully updated');
            localStorage.removeItem('postURLs')
            localStorage.removeItem('bio')
            redirect();
        } else{
            toast.dismiss();
            toast.error(response.msg);
            setTimeout(()=>{
                window.location.reloadd();
            }, 2000)
        }

    }



    return (
        <div className="h-[100vh] w-[100vw] bg-black flex overflow-hidden">
            <NavBar />
            <div className='w-[86%] h-[100vh] pt-[2%] overflow-y-scroll overflow-x-hidden '>

                <div className='  relative text-white h-[5%] w-[100%] pl-[5%]   text-[1.5rem] '>Settings</div>

                <div className="h-[115vh] w-[100%] pl-[5%]  flex items-center scale-[90%]">


                    <div className="h-[100%] w-[25%]  border-solid border-[1px] ">

                        <div className="w-[100%] h-[35%] flex flex-col pt-[2rem] pl-[2rem] text-white border-b">
                            <div className="flex gap-[5px] items-center mb-[1rem]">
                                <BsMeta className="text-blue-600 text-[2rem]" />
                                <div className="text-white">Meta</div>
                            </div>
                            <div className="mb-[0.5rem]">Account Center</div>
                            <div className="text-[0.8rem] opacity-80">Manage your connected</div>
                            <div className="text-[0.8rem] opacity-80">experiences and account settings</div>
                            <div className="text-[0.8rem] opacity-80 mb-[0.8rem]">across Meta technologies.</div>

                            <div className="flex items-center gap-2">
                                <IoPersonOutline />
                                <div className="text-[0.9rem] opacity-80">Personal details</div>
                            </div>
                            <div className="flex items-center gap-2 ">
                                <BsShieldCheck />
                                <div className="text-[0.9rem] opacity-80">Password and security</div>
                            </div>
                            <div className="flex items-center gap-2 mb-[0.5rem]">
                                <RiAdvertisementLine />
                                <div className="text-[0.9rem] opacity-80">Ad preferences</div>
                            </div>
                            <div className="text-blue-600 font-semibold text-[0.9rem]">See more in Accounts Center</div>


                        </div>

                        <div className=" w-[100%] h-[60%] flex flex-col text-white pb-[2rem]">
                            <div className="w-[100%] hover:cursor-pointer hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem] ">Edit profile</div>
                            <div className="w-[100%] hover:cursor-pointer hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem]">Apps and websites</div>
                            <div className="w-[100%] hover:cursor-pointer hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem]">Email notifications</div>
                            <div className="w-[100%] hover:cursor-pointer hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem]">Push notifications</div>
                            <div className="w-[100%] hover:cursor-pointer hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem]">What you see</div>
                            <div className="w-[100%] hover:cursor-pointer hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem]">Who can see your content</div>
                            <div className="w-[100%] hover:cursor-pointer flex flex-col gap-0 justify-center relative top-[6px] hover:bg-[rgba(33,33,33,1.0)] h-[3rem] pl-[2rem]">
                                <div>How other can interact with</div>
                                <div className="relative top-[-10px]">you</div>
                            </div>
                            <div className="w-[100%] hover:cursor-pointer  hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem]">Supervison</div>
                            <div className="w-[100%] hover:cursor-pointer  hover:bg-[rgba(33,33,33,1.0)] flex items-center h-[10%] pl-[2rem]">Help</div>
                            <div className="w-[100%]  flex flex-col gap-0 justify-center relative top-[6px] text-blue-500 font-semibold hover:cursor-pointer h-[10%] pl-[2rem]">
                                <div>Switch account to professional</div>
                                <div className="relative top-[-10px]">account</div>
                            </div>

                        </div>

                    </div>

                    <div className="h-[100%] w-[60%] border-t border-b border-r flex flex-col text-white pt-[2rem] ">
                        <div className="w-[100%] text-[1.5rem] pl-[4rem] ">Edit profile</div>

                        <div className="w-[100%] mt-[3rem] pl-[10rem]  flex gap-[2rem]">
                            <div className="h-[3rem] w-[3rem] border-solid border-[1px] rounded-full overflow-hidden">
                                <img src={loginDetail.profile} className="h-[100%] w-[100%]" alt="profile"></img>
                            </div>
                            <div>
                                <div className="text-white">{loginDetail.username}</div>
                                <div>
                                    <input type='file' id="profileType" className='bg-red-900 hidden' onChange={handleFileUpload} />
                                    <label htmlFor="profileType" className='hover:cursor-pointer text-blue-600  font-semibold'>Change Profile photo</label>
                                </div>
                            </div>
                        </div>

                        <div className="w-[100%] mt-[3rem] pl-[10rem]  flex gap-[2rem]">
                            <div className="font-semibold">Website</div>
                            <input type="text" className="w-[25rem] h-[2rem] bg-[#2c2b2b] placeholder:pl-[1rem] placeholder:font-light rounded-md" placeholder="Website"></input>
                        </div>
                        <div className="text-white font-light text-[0.9rem] pl-[16rem] mt-[0.6rem]">Editing your links is only available on mobile. Visit the Instagram</div>
                        <div className="text-white font-light text-[0.9rem] pl-[16rem] mt-[-0.4rem]">app and edit your profile to change the websites in your bio.</div>

                        <div className="w-[100%] mt-[3rem] pl-[10rem]  flex gap-[2rem]">
                            <div className="font-semibold">Bio</div>
                            <input id="bio" value={details.bio} onChange={ActivateSubmitButton} type="text" className="pl-[2rem] ml-[2rem] w-[25rem] h-[4rem] bg-black border-solid border-[1px]  placeholder:font-light rounded-md" placeholder="Enter your bio"></input>
                        </div>


                        <div className="w-[100%] mt-[3rem] pl-[10rem]  flex gap-[2rem]">
                            <div className="font-semibold">Gender</div>
                            <input id="gender" value={details.gender} onChange={ActivateSubmitButton} type="text" className=" w-[25rem] h-[3rem] bg-black border-solid border-[1px] pl-[2rem] placeholder:font-light rounded-md" placeholder="Male, female or others"></input>
                        </div>
                        <div className="text-white font-light text-[0.9rem] pl-[16rem] mt-[0.6rem]">This won’t be part of your public profile.</div>

                        <div className="w-[100%] mt-[3rem] pl-[6rem]  flex gap-[2rem]">
                            <div className="font-semibold w-[8rem]">Show account suggestions on profiles</div>
                            <div className="flex items-center">
                                <input type="checkbox" className="border-[1px] border-solid bg-black ml-[-0.8rem] w-[2rem] h-[1rem]"></input>
                                <div className="w-[23rem]">Choose whether people can see similar account suggestions on your profile, and whether your account can be suggested on other profiles.<span className="text-blue-600 font-semibold relative pl-[4px]">[?]</span></div>
                            </div>
                        </div>

                        <div className="relative bg-red-400 top-[2rem] ml-[15rem]">
                            <button className={`h-[2rem] rounded-lg absolute w-[5rem] hover:cursor-pointer bg-blue-600 text-white`} onClick={SubmitDetails}>Submit</button>
                            <div className={`h-[2rem] absolute rounded-lg bg-[rgba(0,0,0,0.6)]  backdrop-blur-0 w-[5rem] ${changes && ('hidden')}`}></div>
                        </div>

                    </div>



                </div>


                <div className="relative min-h-[5%] w-[100%]  mt-[3rem] mb-[2rem]"></div>
            </div>
        </div>
    );
}

export default Settings;


