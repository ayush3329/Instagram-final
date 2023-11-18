import React, { useEffect } from 'react';
import { AiFillFacebook } from 'react-icons/ai';
import { inValidPasswordState, loginDetailRecoil } from '../Context/InstagramContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AiOutlineSetting } from 'react-icons/ai';
import { useRecoilState } from 'recoil';
import { LoginResponseType } from '@ayush/ui'
import { loginDetailType } from '@ayush/ui/dest/ContextTypes';


function Login(): React.JSX.Element {

  const [inValidPassword, setInvalidPassword] = useRecoilState(inValidPasswordState)
  const [loginDetail, setLoginDetail] = useRecoilState(loginDetailRecoil)

  useEffect(() => {
    // Save loginDetail in localStorage
    // localStorage.clear();
    localStorage.setItem('username', loginDetail.username);//remaining key value pair for locastorage are created down
    console.log('loginDetail stored in localStorage:', loginDetail);
  }, [loginDetail]);

  function LoginDetailChange(event: React.ChangeEvent<HTMLInputElement>) {

    console.log(loginDetail);

    setLoginDetail((prev) => {
      return {
        ...prev,
        [event.target.id]: event.target.value,
      };
    });
  }

  async function CallAPI() {
    const dataBody = {
      username: loginDetail.username,
      password: loginDetail.password,
    };

    try {
      const response: Response = await fetch('http://127.0.0.1:1769/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataBody),
        credentials: 'include', // Include credentials (cookies) in the request
      });
      const data: LoginResponseType = await response.json();
      console.log("response", data);

      if (data.msg === "adminPage") {
        return 'admin'
      }
      else if (data.success === true) {
        console.log("Inside it", data);
        setLoginDetail((prev: loginDetailType) => {
          return {
            ...prev,
            fullname: data.fullname || '',
            profile: data.profile || ''
          }
        })
        localStorage.setItem('profile', data.profile || '');
        localStorage.setItem('fullname', data.fullname || '');
        setInvalidPassword(false);
        return 'Logged in';
      }
      else if (data.msg === 'Incorrect password, please double check before submitting') {
        setInvalidPassword(true);
        return 'incorrect password';
      }
      else if (data.msg === 'User does not exist') {
        setInvalidPassword(false);
        return 'user does not exist';
      }

    } catch (e) {
      console.log('error', e);
    }
  }

  const nav = useNavigate();

  function redirect() {
    nav('/HomePage');
  }
  function adminPage() {
    nav('/admin')
  }

  async function FormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const ans = await CallAPI();
      console.log('ans', ans);
      if (ans === "admin") {
        toast.dismiss();
        toast.success("AdminPage")
        adminPage();
      }
      else if (ans === 'Logged in') {
        redirect();
        toast.dismiss();
        toast.success('Logged in');
      } else if (ans === 'incorrect password') {
        toast.dismiss();
        toast.error('Incorrect password');
      } else if (ans === 'user does not exist') {
        toast.dismiss();
        toast.error('User does not exist');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Invalid password');
      console.log('error', error);
    }
  }


  return (
    <form onSubmit={FormSubmit} className='w-[100%] flex flex-col items-center pt-[2.5rem]'>
      <input id="username" required value={loginDetail.username} onChange={LoginDetailChange} type="text" placeholder='Phone no, username, email' className='bg-[rgba(38,50,56,1.0)] w-[80%] h-[1.8rem] placeholder:text-white 
            placeholder:opacity-50  placeholder:pl-[0.5rem] text-white pl-[0.5rem] placeholder:text-[0.9rem]'/>
      <input id="password" required value={loginDetail.password} onChange={LoginDetailChange} type="password" placeholder='Password' className='mt-[15px] bg-[rgba(38,50,56,1.0)] w-[80%] h-[1.8rem] placeholder:text-white 
            placeholder:opacity-50  placeholder:pl-[0.5rem] text-white pl-[0.5rem] placeholder:text-[0.9rem]'/>
      <button className='hover:bg-blue-700 mt-[15px] bg-blue-500 rounded-lg  w-[80%] h-[1.9rem] text-[0.8rem] text-white pl-[0.5rem]'>Log in</button>
      <div className='w-[100%] flex mt-[1.4rem] items-center gap-[10px] justify-center'>
        <div className='h-[1px] w-[30%] border-[0.5px] border-solid opacity-60'></div>
        <div className='text-white text-[0.9rem]' >OR</div>
        <div className='h-[1px] w-[30%] border-[1px] border-solid opacity-60'></div>
      </div>
      <div className='flex text-white items-center gap-[5px] mt-[1rem] mb-[1.5rem]'>
        <AiFillFacebook className='text-[1.5rem] text-blue-700' />
        <span className='text-[0.9rem]'>Login with facebook</span>
      </div>

      {
        inValidPassword && (
          <div className='flex flex-col items-center justify-center  mb-[1.5rem]'>
            <div className='text-red-600 text-[0.8rem] mb-[0.01em]'>Sorry, your password was incorrect. Please</div>
            <div className='text-red-600 text-[0.8rem]'>double-check your password.</div>
          </div>
        )
      }

      <div className='text-white  opacity-60  text-[0.9rem]'>Forgot Password?</div>
      <AiOutlineSetting />
    </form>
  );
}

export default Login;