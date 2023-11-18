import React, { useEffect, useState } from 'react';
import { formTypeState, loginDetailRecoil } from '../Context/InstagramContext';
import { useSetRecoilState } from 'recoil';
import { loginDetailType } from '@ayush/ui/dest/ContextTypes';
// import {SlCheck} from 'react-icons/sl'

function SignUp(): React.JSX.Element {
  interface signUpobj {
    email: string,
    fullname: string,
    username: string,
    password: string
  }
  const setFormType = useSetRecoilState(formTypeState)
  const setLoginDetail = useSetRecoilState(loginDetailRecoil)

  const [signupDetail, setSignupDetail] = useState<signUpobj>({ email: '', fullname: '', username: '', password: '' });
  
  useEffect(()=>{
    console.log("t");
    console.log(signupDetail);
  })


  function FormDataChange(event: React.ChangeEvent<HTMLInputElement>) { //NewChange

    setSignupDetail((prev: signUpobj) => {
      return {
        ...prev,
        [event.target.id]: event.target.value
      }
    })
  }

  function allow(dataBody:signUpobj){
    const {username, password, email, fullname} = dataBody;
    console.log(username, password);
    if(!username || !password || !email || !fullname){
      console.log("false");
      return false;
    }
    return true;
  }

  async function insertDataInDb() {
    console.log(signupDetail.username, signupDetail.password);

    const dataBody = {
      username: signupDetail.username,
      email: signupDetail.email,
      password: signupDetail.password,
      fullname: signupDetail.fullname,
    };

    if(!allow(dataBody)){
      return;
    }

    

    try {
      const response = await fetch('http://127.0.0.1:1769/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataBody),
      });
      if (response.ok) {
        console.log('Data inserted successfully');
        setLoginDetail((prev:loginDetailType) => {
          return {
            ...prev,
            username: signupDetail.username
          }
        })
        setFormType("login")
      } else {
        console.log('Error:', response.status);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }

  function FormDataSubmit(event: React.FormEvent<HTMLFormElement>) { //NewChange
    event.preventDefault();
    insertDataInDb();
  }
  return (
    <form className='relative w-[100%] flex flex-col items-center pt-[1.1rem] pb[2rem] overflow-x-hidden' onSubmit={FormDataSubmit}>
      <div className='text-white flex items-center justify-center opacity-60'>Sign up to see photos and videos</div>
      <div className='text-white flex items-center justify-center mb-[0rem] opacity-60'>from your friends.</div>
      <button className='hover:bg-blue-700 mt-[15px] bg-blue-500 rounded-lg  w-[80%] h-[1.9rem] text-[0.8rem] text-white pl-[0.5rem] mb-[1rem]'>Log in with facebook</button>
      <div className='w-[100%] flex  items-center gap-[10px] justify-center mb-[1rem]'>
        <div className='h-[1px] w-[34%] border-[0.5px] border-solid opacity-60'></div>
        <div className='text-white text-[0.9rem]' >OR</div>
        <div className='h-[1px] w-[34%] border-[1px] border-solid opacity-60'></div>
      </div>
      <input id="email" value={signupDetail.email} onChange={FormDataChange} type="text" placeholder='Mobile Number or email' className='bg-[rgba(38,50,56,1.0)] w-[80%] h-[1.8rem] placeholder:text-white 
            placeholder:opacity-50  placeholder:pl-[0.5rem] text-white pl-[0.5rem] placeholder:text-[0.9rem] placeholder:font-extralight'/>
      {/* <SlCheck className={`absolute top-[10.7rem] left-[17rem] text-red-500`}/> */}
      <input id="fullname" value={signupDetail.fullname} onChange={FormDataChange} type="text" placeholder='Full Name' className='bg-[rgba(38,50,56,1.0)] w-[80%] h-[1.8rem] placeholder:text-white  placeholder:font-extralight
            placeholder:opacity-50  placeholder:pl-[0.5rem] text-white pl-[0.5rem] placeholder:text-[0.9rem] mt-[10px]'/>
      {/* <SlCheck className='absolute top-[13.1rem] left-[17rem] text-red-500'/> */}
      <input id="username" value={signupDetail.username} onChange={FormDataChange} type="text" placeholder='Username' className='bg-[rgba(38,50,56,1.0)] w-[80%] h-[1.8rem] placeholder:text-white placeholder:font-extralight
            placeholder:opacity-50  placeholder:pl-[0.5rem] text-white pl-[0.5rem] placeholder:text-[0.9rem] mt-[10px]'/>
      {/* <SlCheck className='absolute top-[15.5rem] left-[17rem] text-red-500'/> */}
      <input id="password" value={signupDetail.password} onChange={FormDataChange} type="password" placeholder='Password' className='mt-[10px] bg-[rgba(38,50,56,1.0)] w-[80%] h-[1.8rem] placeholder:text-white placeholder:font-extralight
            placeholder:opacity-50  placeholder:pl-[0.5rem] text-white pl-[0.5rem] placeholder:text-[0.9rem]'/>
      {/* <SlCheck className='absolute top-[18rem] left-[17rem] text-red-500'/> */}
      <div className='text-white text-[0.75rem] mt-[1.3rem] flex items-center justify-center opacity-60'>People who use our service may have uploaded</div>
      <div className='text-white  text-[0.75rem] flex items-center justify-center mb-[0rem] opacity-60'>your contact information to Instagram. Learn</div>
      <div className='text-white  text-[0.75rem] flex items-center justify-center mb-[0rem] opacity-60'>More</div>

      <div className='text-white text-[0.75rem] mt-[1.3rem] flex items-center justify-center opacity-60'>By signing up, you agree to our Terms , Privacy</div>
      <div className='text-white  text-[0.75rem] flex items-center justify-center mb-[0rem] opacity-60'>Policy and Cookies Policy .</div>
      <button className='hover:bg-blue-700 mt-[15px] bg-blue-500 rounded-lg  w-[80%] h-[1.9rem] text-[0.8rem] text-white pl-[0.5rem] mb-[1rem]'>Sign up</button>
    </form>
  );
}

export default SignUp;