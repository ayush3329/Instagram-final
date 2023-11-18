import React, {  ChangeEvent, useEffect, useState } from 'react';
import Frame from '../Assets/Frame.png'
import play from '../Assets/play.png'
import microsoft from '../Assets/microsoft.png'
import Login from '../component/Login';
import SignUp from '../component/SignUp';
import {  useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { formTypeState, inValidPasswordState } from "../Context/InstagramContext";


function LogSign():React.JSX.Element {

    const formType = useRecoilValue(formTypeState);
    const setFormType  = useSetRecoilState(formTypeState)
    const [inValidPassword, setInvalidPassword] = useRecoilState(inValidPasswordState)

    function FormType(event:React.MouseEvent<HTMLDivElement>){ // NewChange
        if(event.currentTarget.id==="login"){ // NewChange
            setFormType("login");
        }
        else{
            setFormType("signup")
        }
    }

    const insta = "https://www.pngkey.com/png/full/828-8286178_mackeys-work-needs-no-elaborate-presentation-or-distracting.png";
    return (
        <div className={`w-[100vw]  ${formType==="signup" ? ('h-[115vh]'): ('h-[100vh]')}  bg-black flex justify-center pt-[1rem] overflow-hidden`}>
            {
                formType==="login" && <div className=''>
                    <img src={Frame} alt="Phone" className='h-[88%]'/>
                </div>
            }
            {/* ${inValidPassword ? ('h-[65%]') : ('h-[56%]')} */}
            <div className= {`${formType==="signup" ? ('w-[22%]'): ('w-[20%]')}`} >
                <div className={` ${formType==="login" ? ('mt-[1.3rem]  pt-[2.5rem]') :('mt-[0.5rem] pt-[1.5rem]')} w-[100%] border-[1px] border-solid border-slate-400   ${formType==="signup" ? ('h-[85vh] mt-[0rem]') : inValidPassword ? ('h-[65%]') : ('h-[56%]') }  flex flex-col items-center overflow-x-hidden`}>
                    <img src={insta} alt="Instagram" className='w-[45%] h-[2.8rem]'/>
                    {
                        formType === "login" ? (<Login/>) : (<SignUp/>)
                    }
                </div>
                <div className='w-[100%] h-[10vh] border-[1px] border-solid border-slate-400 mt-[0.5rem] flex gap-[5px] items-center justify-center'>
                    {
                        formType==="login" ? (<div className='text-white font-extralight'>Don't have an account? </div>) : (<div className='text-white font-extralight'>Have an account? </div>)
                    }
                    {
                        formType==="login" ? (<div id="signup" className='text-blue-500 text-[1rem] hover:cursor-pointer' onClick={FormType}>Sign up</div>) : (<div id="login" className='text-blue-500 text-[1rem] hover:cursor-pointer' onClick={FormType}>Login</div>)
                    }
                </div>
                <div className='w-[100%] text-white flex items-center justify-center mt-[0.5rem] mb-[0.4rem]'>Get the App</div>
                <div className='flex w-[100%] overflow-hidden items-center justify-center'>
                    
                    <img src={play} alt="google"  className='h-[3.5rem] '/>
                    <img src={microsoft} alt="microsoft" className='h-[2.4rem] w-[8rem]'/>
                </div>
            </div>

        </div>
    );
}

export default LogSign;