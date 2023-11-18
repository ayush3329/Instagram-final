import React from 'react'
import "./App.css";
import { Routes, Route } from "react-router-dom";
import LogSign from "./Pages/LogSign";
import HomePage from "./Pages/HomePage";
import ProfilePage from "./Pages/ProfilePage";
import SearchPage from "./Pages/SearchPage";
import Settings from "./component/Settings";
import SearchedUserPage from "./Pages/SearchedUserPage";
// import Admin from "./Pages/Admin";
import Notification from "./Pages/Notification";
import Message from "./Pages/Message";

function App():React.JSX.Element {
  return (
    <>
      <Routes>
        <Route path="/" element={<LogSign/>}/>
        <Route path="/HomePage" element={<HomePage/>}/>
        <Route path="/Profilepage" element={<ProfilePage />} />
        <Route path="/Search" element={<SearchPage/>}/>
        <Route path="/setting" element={<Settings />}/>
        <Route path="/searchedUser" element={<SearchedUserPage/>}/>
        {/* <Route path= "/admin" element={<Admin/>}/> */}
        <Route path="/notification" element={<Notification/>} />
        <Route path="/message" element={<Message/>} />

      </Routes>
    </>
  );
}

export default App;

