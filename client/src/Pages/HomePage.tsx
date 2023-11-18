import './PageCSS.css';
import NavBar from '../component/NavBar';
import { useEffect } from 'react';
import { checkLoginStatusState, loginDetailRecoil } from '../Context/InstagramContext';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loginDetailType } from '@ayush/ui/dest/ContextTypes';
import ProgressBar from '../component/ProgressBar';


function HomePage() {
  const checkLoginStatus = useRecoilValue(checkLoginStatusState);
  const setLoginDetail = useSetRecoilState(loginDetailRecoil)

  const nav = useNavigate();

  async function check() {
    // const res = await checkLoginStatus();
    // console.log("res-> ", res);
    // if (res) {
    //   console.log("valid cookie");
    // } else {
    //   localStorage.clear();
    //   nav('/')
    // }
  }

  async function getMyDetails() {
    // console.log("Fetching post");
    // const dataBody = { fullname: localStorage.getItem('fullname') };
    // var dataS = await fetch('http://127.0.0.1:1769/api/v1/getPosts', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(dataBody),
    //   credentials: 'include',
    // });
    // dataS = await dataS.json();
    // console.log("Data-> ", dataS);
    // // setData(dataS.data)
  }

  useEffect(() => {

    // check();

    const userName = localStorage.getItem("username") || ''
    const passWord = localStorage.getItem("password") || ''
    const fullName = localStorage.getItem("fullname") || ''
    const Profile = localStorage.getItem("profile") || ''

    setLoginDetail((prev: loginDetailType): loginDetailType => {
      return {
        username: userName,
        password: passWord,
        profile: Profile,
        fullname: fullName,
        post: 0,
        following: 0,
        followers: 0,
        bio: ''
      }
    })
    // getMyDetails();

  }, [])






  return (
    <div className='h-[100vh] w-[100vw] bg-black flex flex-col'>
      <div className='relative h-[1%] w-[100%]'>
        <ProgressBar/>
      </div>

      <div className="h-[100%] w-[100%] bg-black flex overflow-hidden " >
        <NavBar />
        <div className={` relative w-[86%] pl-[3rem] overflow-y-auto text-white`}></div>
      </div>
      


    </div>
  );
}

export default HomePage;
