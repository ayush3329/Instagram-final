import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

function Admin() {
    const [alluser, setAllUser] = useState([]);
    
    async function getAllUser(){
        var response = await fetch("http://127.0.0.1:1769/api/v1/admin", {
            method: 'GET'
        })
        response = await response.json();
        setAllUser(response.detail)
        console.log("All user detail", response.detail);
    }
    useEffect(()=>{
    getAllUser();
    }, [])
    
    async function ChangePromotionStatus(event){
        const request = event.target.id;
        const value = +event.target.className.split(' ')[0];
        console.log("num ", value);

        if(request==="on"  && alluser[value-1].promoted===true){
            console.log("Waste of time on===on");
            return;
        } else if(request==="off" && alluser[value-1].promoted===false){
            console.log("waste of time  off===off");
            return;
        } else {
            
            setAllUser((prev) => {
                const updatedUsers = [...prev]; // Create a new array by spreading the previous state
                updatedUsers[value - 1] = { ...updatedUsers[value - 1], promoted: !updatedUsers[value - 1].promoted }; // Update the specific user's promoted property
                return updatedUsers; // Set the updated array as the new state value
            }); // most important

            const dataBody = {
                username: alluser[value-1].username
            }
            console.log("databody", dataBody);
            var response = await fetch('http://127.0.0.1:1769/api/v1/promotion_status', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataBody)
            });
            response = await response.json();
            if(!response.success){
                toast.dismiss();
                toast.error("Something went wrong");
                setTimeout(()=>{
                    window.location.reload();
                }, 500)
            }
        } 
        // window.location.reload();
    }
    var i = 0;
    return (
        <div className='text-white w-[100vw] min-h-[100vh] bg-black flex flex-col items-center pt-[1.3rem]'>
            <div className='text-[2rem] text-blue-400'>Welcome to admin Page</div>
            <div className='text-white relative top-[3rem] left-[14rem] opacity-40'>Promoted Account</div>
            <div className=' w-[100%] min-h-[0%] flex flex-col items-center mt-[2.5rem] '>
                {
                    alluser.map((indi)=>{
                        i++;
                        return(
                            <div id={i} className='h-[5rem] w-[70%]  mb-[2rem] flex items-center pl-[14rem] gap-[1rem]'>
                                <div className='h-[3rem] w-[3rem] rounded-full overflow-hidden'> <img src={indi.profile} alt="profile" className='w-[100%] h-[100%]' /></div>
                                <div className='text-white w-[25rem] text-[1.5rem] opacity-60' >{indi.username}</div>
                                <div className='h-[2rem] w-[7rem] border-solid border-[1px] rounded-3xl relative flex justify-between overflow-hidden'>
                                    <div id="off" className={`${i} text-white h-[100%] w-[50%]  ${!indi.promoted && ('bg-red-500')} pl-[4px] hover:cursor-pointer ${indi.promoted && ('hover:bg-[rgba(33,33,33,1.0)] hover:font-bold')}`} onClick={ChangePromotionStatus}>off</div>
                                    <div id="on" className={`${i} text-white  w-[50%] ${indi.promoted && ('bg-green-500')} pl-[4px] hover:cursor-pointer ${!indi.promoted && ('hover:bg-[rgba(33,33,33,1.0)] hover:font-bold')}`} onClick={ChangePromotionStatus}>on</div>
                                </div>
                                    <div></div>
                            </div>
                        )
                       
                    })
                }
            </div>

        </div>
    );
}

export default Admin;