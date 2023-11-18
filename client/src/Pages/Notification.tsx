import React from 'react';
import NavBar from '../component/NavBar';

function Notification() {
    return (
        <div className="h-[100vh] w-[100vw] bg-black flex overflow-hidden " >
            <NavBar />
            <div className={`relative w-[86%] pl-[3rem] overflow-y-auto text-white`}>

            </div>
        </div>
    );
}

export default Notification;