import React from 'react';
import './LoaderCSS.css'
function Loader() {
    return (
        <div className='h-[100vh] w-[100vw] absolute flex items-center justify-center z-[10] bg-[rgba(0,0,0,0.3)] backdrop-blur-[1px]  '>

            <div className="relative left-[2rem] lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>
    );
}

export default Loader;