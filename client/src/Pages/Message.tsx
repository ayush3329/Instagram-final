import React, { useEffect, useState } from 'react';
import NavBar from '../component/NavBar';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { InstagramProgressBar, MessageReceivers_FullDetailState, setChaneGroupNameState, setChatListState, showOnlyLogo, webSocketRef } from '../Context/InstagramContext';
import { RxCross2 } from 'react-icons/rx';
import { RiMessengerLine } from 'react-icons/ri';
import { BiSolidSmile } from 'react-icons/bi';
import { IoCallOutline } from 'react-icons/io5';
import { HiOutlineVideoCamera } from 'react-icons/hi2';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { VscVerifiedFilled } from 'react-icons/vsc'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import toast from 'react-hot-toast';
import { ChatsType, Genz, Peer2PeerChatType, Rookie, SearchUserType } from '@ayush/ui/dest/ApiControllerTypes'
import { Group, PacketType, chatDetail, createdGroupDetails, newGroupName, receiveMessagePacket, sendMessagePacket, zeroUnseenMessage } from '@ayush/ui';
import PreviouChatUser from '../component/PreviousChatUser';
import ProgressBar from '../component/ProgressBar';
import { Debris, groupParticipantDetail } from '@ayush/ui/dest/ContextTypes';

function Message(): React.JSX.Element {
    const [isAdmin, setIsAdmin] = useState(false);
    const [TakeAction, setTakeAction] = useState('');
    const [InstagramProgress, setInstagramProgressBar] = useRecoilState(InstagramProgressBar)
    const setShowIcon = useSetRecoilState(showOnlyLogo);
    const [changeGroupNameWindow, setChnagegroupNameWindow] = useState(false)
    const [groupName, setChaneGroupName] = useRecoilState(setChaneGroupNameState);
    const [ChatList, setChatList] = useRecoilState(setChatListState);
    const [ShowGroupSetting, setShowGroupSetting] = useState(false); //This state will manage the screen containing option to make a group member admin or to block or to remove them from group

    // const [ChatListReplica, setChatListReplica] = useState([]) //This state is made because ChatList is getting empty inside onmessage function (IDk why)

    const [sendMessageScreen, setsendMessageScreen] = useState<Boolean>(true); // the screen which is the very beginning to send message is handles by this state
    const [userInfo, setUserInfo] = useState(false); //want to check user (or group) info of current opened chat
    const [searchUserScreen, setSearchUserScreen] = useState<Boolean>(false); //search user to to have conversation
    const [TextMessage, setTextMessage] = useState(''); //this state holds the message you want to send to other user
    const [rs, setRS] = useRecoilState(webSocketRef);

    const [userToSearchinDB, setUserToSearchinDB] = useState('');
    const [db_ack_userDetail, setdb_ack_userDetail] = useState<(Genz & { select: boolean })[]>([]) // profile, fullname, username, select
    const [activeChatButton, setactiveChatButton] = useState(false)
    const [emptySearchBar, setemptySearchBar] = useState(true);

    const [selectedUser, setSelectedUser] = useState<string[]>([]); //this contain fullname of all those user whom our client wants to send message (could be one person pr could be more than 1)
    const [MessageReceivers_FullDetail, setMessageReceivers_FullDetail] = useRecoilState(MessageReceivers_FullDetailState) //this contain all the detail of users which are inside "MessageReceivers"

    const [chatMessages, setChatMessages] = useState<chatDetail[]>([]);

    useEffect(() => {
        console.log("ChaatMessages useEffect ", chatMessages);
    }, [chatMessages]);

    async function UpdateMessage(mes: chatDetail, socket: WebSocket) {

        console.log("UpdateMessage ");
        const ChatListReplica: ChatsType[] = JSON.parse(localStorage.getItem('ChatList') || "{}")

        if (ChatListReplica.keys === undefined) {
            console.log("Undefine");
            toast.dismiss();
            toast.error("ChatList not updated")
            return;
        } else {
            console.log("ChatList ", ChatListReplica);
        }

        console.log("message received from backend ", mes);
        console.log("Previos ChaatMessages ", chatMessages);

        if (mes.chatType === "oc") {

            console.log("ORdinary Chat \n");
            console.log(mes.sender, " ", localStorage.getItem('MessageReceiver'));

            if (mes.sender === localStorage.getItem('MessageReceiver')) {

                // If control reaches inside this if block, that means we have to show message to the client because client has opened the chat window of correct user
                console.log("oc");
                console.log("Here", chatMessages);
                mes.status = "seen";
                setChatMessages((prev: chatDetail[]) => {
                    console.log("During updation ");
                    console.log(prev, "\n\n\n");
                    return [...prev, { content: mes.content, sender: mes.sender, receiver: mes.receiver, chatType: mes.chatType, status: mes.status }]
                })
                console.log(chatMessages);

                setChatList((prev) => {
                    console.log("ChatList form inside ", prev);
                    return prev;
                })

                zeroUnseenMessage(socket as WebSocket, "zeroUnseenMessage", { myName: mes.receiver[0], sender: mes.sender, type: "oc" });

            }
        }
        else {
            //GroupChat
        }
    }

    function UpdateChatList(newChatList: ChatsType) {
        console.log("Update chat list \n\n");
        setChatList((prev: ChatsType[]) => {
            const newPrev: ChatsType[] = [];

            for (let i = 0; i < prev.length; i++) {
                if (prev[i].name !== newChatList.name) {
                    console.log(prev[i].name, " ", newChatList.name, " ", newChatList.useenCount);
                    newPrev.push(prev[i]);
                }
            }

            if (localStorage.getItem('MessageReceiver') === newChatList.name) {
                newChatList.useenCount = 0;
            }

            const obj: ChatsType = { name: newChatList.name, profile: newChatList.profile, type: newChatList.type, gid: newChatList.gid, useenCount: newChatList.useenCount };
            newPrev.unshift(obj);


            localStorage.setItem('ChatList', JSON.stringify(newPrev))
            return [...newPrev];


        })
    }

    function AddNewGroupToList(newGroup: createdGroupDetails) {
        const GroupDetail = newGroup.groupDetail
        const groupname = GroupDetail?.name || '';
        const profile = GroupDetail?.profile || '';
        const participant = GroupDetail?.parti || [{ username: '', fullname: '', profile: '' }]
        setMessageReceivers_FullDetail({ name: groupname, profile: profile, messages: [], groupChat: true, parti: participant });
        // groupname, grouprpofile, messages, isGroupChat, participan

        setChatList((prev: ChatsType[]) => {
            const obj = { name: groupname, profile: profile, type: "gc", gid: newGroup.id as Object, useenCount: 0 }
            return [obj, ...prev];
        })
        setChaneGroupName(groupname);
    }

    function GrpNameChanged(Packet: newGroupName) {

        setChatList((prev: ChatsType[]) => {

            const newPrev: ChatsType[] = [];
            for (let i = 0; i < prev.length; i++) {
                if (prev[i].type === "gc" && prev[i].gid === Packet.id) {
                    newPrev.push({ name: Packet.newGroupName, gid: prev[i].gid, profile: prev[i].profile, type: prev[i].type, useenCount: prev[i].useenCount })
                } else {
                    newPrev.push(prev[i])
                }
            }


            return [...newPrev]
        })

        console.log("MessageRecievver", MessageReceivers_FullDetail);

        setMessageReceivers_FullDetail((prev: Debris) => {
            const newPrev: Debris = { name: Packet.newGroupName, groupChat: prev.groupChat, messages: prev.messages, parti: prev.parti, profile: prev.profile }
            return newPrev;
        })

        setChnagegroupNameWindow(false);
        setChaneGroupName((prev: string) => {
            return Packet.newGroupName
        });
        setInstagramProgressBar(false);
    }

    function make_group_admin(Packet: { success: boolean, newAdmin: string }) {

        if (Packet.success) {
            console.log(Packet.newAdmin, " is now admin\n");
            setMessageReceivers_FullDetail((prev:Debris)=>{
                
                const newParticipantDetail: groupParticipantDetail[] = [];

                for(let i=0; i<prev.parti.length; i++){
                    if(prev.parti[i].fullname === Packet.newAdmin){
                        newParticipantDetail.push({admin: true, fullname: prev.parti[i].fullname, profile: prev.parti[i].profile, username: prev.parti[i].username, mainAdmin: (prev.parti[i] as groupParticipantDetail).mainAdmin})
                    } else{
                        newParticipantDetail.push(prev.parti[i] as groupParticipantDetail);
                    }
                }


                let newPrev: Debris = {groupChat: prev.groupChat, messages:prev.messages, name: prev.name, profile: prev.profile, parti: newParticipantDetail};
               
                
                return newPrev;
            })
            setShowGroupSetting(false);
        }
    }
    
    function RemoveAdmin(Packet: {fullname: string}){

        setMessageReceivers_FullDetail((prev:Debris)=>{

            const newParticipantDetail: groupParticipantDetail[] = [];

            for(let i=0; i<prev.parti.length; i++){
                if(prev.parti[i].fullname === Packet.fullname){
                    newParticipantDetail.push({admin: false, fullname: prev.parti[i].fullname, profile: prev.parti[i].profile, username: prev.parti[i].username, mainAdmin: (prev.parti[i] as groupParticipantDetail).mainAdmin})
                } else{
                    newParticipantDetail.push(prev.parti[i] as groupParticipantDetail);
                }
            }
            let newPrev: Debris = {groupChat: prev.groupChat, messages:prev.messages, name: prev.name, profile: prev.profile, parti: newParticipantDetail};
            return newPrev;
        })
        setShowGroupSetting(false);
    }


    async function createSocketconnection() {

        console.log("Websocket request");

        const socket = new WebSocket(`ws://127.0.0.1:9999?userID=${localStorage.getItem('fullname')}`);

        console.log("socket -> ", socket);

        socket.onmessage = async (message: MessageEvent) => {

            console.log("Message from backend");
            const Packet: receiveMessagePacket = JSON.parse(message.data || '{}');
            console.log(Packet);
            console.log("Query ", Packet.query);

            if (Packet.query === "message" && Packet.packet !== undefined) {
                console.log("message query");
                UpdateMessage(Packet.packet as chatDetail, socket)
            } else if (Packet.query === "updateChatList") {
                console.log("updateChatList query");
                console.log(Packet.packet as ChatsType);
                UpdateChatList(Packet.packet as ChatsType);
            } else if (Packet.query === "groupCreated") {
                console.log("Packet ", Packet.packet);
                AddNewGroupToList(Packet.packet as createdGroupDetails)
            } else if (Packet.query === "groupNameChanged") {
                console.log("Packet ", Packet.packet);
                GrpNameChanged(Packet.packet as newGroupName)
            } else if (Packet.query === 'make-group-admin') {
                make_group_admin(Packet.packet as { success: boolean, newAdmin: string })
            } else if(Packet.query === 'removed-as-admin'){
                RemoveAdmin(Packet.packet as {fullname: string})
            }


        }

        socket.onopen = () => {

            if (socket.readyState === 0) {
                console.log("Still connecting");

            } else if (socket.readyState === 1) {

                // socket.send("AyushChamola");

                console.log('WebSocket connection established successfully!', socket.readyState);
                toast.dismiss()
                toast.success("Successfull connection with websocket")
                setRS(socket);

                if (TextMessage.length !== 0) {

                    let mesRec: string[] = [];
                    for (let i = 0; i < MessageReceivers_FullDetail.parti.length; i++) {
                        const user = MessageReceivers_FullDetail.parti[i].fullname;
                        mesRec.push(user)
                    }

                    let newChat = false;

                    if (mesRec.length === 1) {
                        // only for Ordinary Chat

                        for (let i = 0; i < ChatList.length; i++) {
                            if (ChatList[i].name === mesRec[0]) {
                                newChat = true;
                                break;
                            }
                        }

                    }


                    var messagePackage: chatDetail & { newChat?: boolean } = {
                        content: TextMessage,
                        sender: localStorage.getItem('fullname') || '',
                        receiver: mesRec,
                        chatType: mesRec.length > 1 ? "gc" : "oc",
                        status: "unseen"
                    }

                    if (messagePackage.chatType === "oc") {
                        messagePackage.newChat = newChat;
                    }

                    webSocketMessage(socket, "message", messagePackage);

                }

            } else if (socket.readyState === 3) {

                toast.dismiss();
                toast.error("Connection lost")
                console.log("Connection closed", socket);

            } else {
                console.log("in process of closing");
            }

        };

        socket.onerror = (e) => {
            console.log("Error -> ", e);
            toast.dismiss();
            // showReload(true);
            toast.error("Unable to establis connection")
        }

        socket.onclose = () => {
            console.log("Connection closed ");
        }

        setRS(socket);
    }

   

    useEffect(() => {
        setShowIcon(true);
        createSocketconnection();
    }, [])

    useEffect(() => {
        console.log("Chat Message Updated");
        console.log(chatMessages);
    }, [chatMessages])

    useEffect(() => {
        console.log("ChatList Updated ");
        console.log(ChatList);
    }, [ChatList])


    function sendMessage() {

        console.log("Message", TextMessage, " ", rs?.readyState);

        if (rs == null) {
            console.log("rs === null");
            return;
        }
        if (rs.readyState !== 1) {

            console.log('Socket is close, but we are trying to re-establish it');

            createSocketconnection()
                .then(() => {
                    console.log("Creating connection");
                })
                .catch((e) => {
                    console.log("unable to establish connection");
                });

        }
        else {

            if (TextMessage.length === 0) {
                return;
            }

            console.log("Connection is alive");

            let mesRec: string[] = [];
            for (let i = 0; i < MessageReceivers_FullDetail.parti.length; i++) {
                const user = MessageReceivers_FullDetail.parti[i].fullname;
                mesRec.push(user)
            }

            let newChat = true;

            if (mesRec.length === 1) {
                // only for Ordinary Chat

                for (let i = 0; i < ChatList.length; i++) {
                    if (ChatList[i].name === mesRec[0]) {
                        newChat = false;
                        break;
                    }
                }

            }


            var messagePackage: chatDetail & { newChat?: boolean } = {
                content: TextMessage,
                sender: localStorage.getItem('fullname') || '',
                receiver: mesRec,
                chatType: mesRec.length > 1 ? "gc" : "oc",
                status: "unseen"
            }

            if (messagePackage.chatType === "oc") {
                //Id chat is peer 2 peer then in that case it might be a newChat or could be an existing chat, but in groupChat, the chat will always be existing
                messagePackage.newChat = newChat;
            }

            webSocketMessage(rs, "message", messagePackage);

        }
    }

    //ws 
    function zeroUnseenMessage(ref: WebSocket, query: string, Package: zeroUnseenMessage) {
        const Packet: sendMessagePacket = {
            query: query,
            packet: Package
        }
        ref.send(JSON.stringify(Packet))

    }

    //ws
    function webSocketMessage(ref: WebSocket, query: string, Package: PacketType) {

        const Packet: sendMessagePacket = {
            query: query,
            packet: Package
        }

        console.log("Message Package");
        console.log(Packet);
        console.log(ref);
        ref.send(JSON.stringify(Packet));




        if (query === "message" && Package) {
            console.log("Appending Message");
            setChatMessages((prev: chatDetail[]) => {
                return [...prev, Package as chatDetail]
            })

            setTextMessage('')
        }


    }


    function HandleTextMessage(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setTextMessage(event.target.value)
    }


    async function SearchinDB(event: React.ChangeEvent<HTMLInputElement>) {

        const user = event.target.value;
        setUserToSearchinDB(event.target.value);
        setdb_ack_userDetail([]);

        if (user.length === 0) {
            setemptySearchBar(true);
            setactiveChatButton(false);
            return;
        }

        setemptySearchBar(false);
        setactiveChatButton(true);


        var response: Response = await fetch(`http://127.0.0.1:1769/api/v1/search/${user}`, {
            method: 'POST',
            credentials: 'include'
        });

        const data: SearchUserType = await response.json();
        console.log("data", data);

        if (data.success === false) {
            //no user matched in DB with provided username
            return;
        }

        console.log("user ", data.user);

        var supportArray: Genz[] | [] = data.user || [];
        console.log(supportArray.length);


        for (let i = 0; i < supportArray.length; i++) {
            if (supportArray[i].fullname === localStorage.getItem('fullname')) {
                supportArray.splice(i, 1);
                break;
            }
        }
        console.log(supportArray.length);
        var helper: (Genz & { select: boolean })[] = []

        for (let i = 0; i < supportArray.length; i++) {

            const indi = supportArray[i];
            var selectStatus = false;

            console.log(indi.username, "eq");
            for (let j = 0; j < selectedUser.length; j++) {
                if (selectedUser[j] === indi.fullname) {
                    console.log("found");
                    selectStatus = true;
                    break;
                }
            }


            helper.push({ profile: indi.profile, username: indi.username, fullname: indi.fullname, select: selectStatus })

        }

        setdb_ack_userDetail(helper)

    }


    function SelectThisUser(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {

        const userToSelect: string = event.currentTarget.id || ''

        console.log("Selected User ", selectedUser);

        var index = selectedUser.indexOf(userToSelect)

        if (index === -1) {

            console.log("user to select ", event.currentTarget.id, selectedUser);
            // Select this user to send message
            setSelectedUser((prev) => {
                return [...prev, userToSelect]
            })

        } else {
            console.log("user to remove ", event.currentTarget.id, index, selectedUser);
            //remover this user

            const val = selectedUser[index];
            const helper = selectedUser.filter((item) => item !== val);
            console.log("helper-> ", helper);
            const supportiveArray = [...helper];
            if (supportiveArray.length === 0) {
                setactiveChatButton(false);
            }
            setSelectedUser(supportiveArray);

        }

        setdb_ack_userDetail((prev) => {

            prev.map((indi) => {
                if (indi.fullname === userToSelect) {
                    indi.select = !indi.select;
                }
                return indi;
            })
            return prev
        })


    }


    function CloseSearchUserWindow() {

        setSearchUserScreen(false);
        setUserToSearchinDB('');
        setdb_ack_userDetail([]);
        setemptySearchBar(true);
        setSelectedUser([]);
    }

    function MakeAdmin() {
        const gid: string = localStorage.getItem('MessageReceiver') || ''
        webSocketMessage(rs as WebSocket, 'make-group-admin', { fullname: TakeAction, gid: gid})
    }

    function RemoveAsAdmin() {
        console.log("Remove Admin");
        const gid: string = localStorage.getItem('MessageReceiver') || ''
        console.log("Gid ", gid);
        console.log("Fullname ", TakeAction);
        webSocketMessage(rs as WebSocket, 'remove-admin', { fullname: TakeAction, gid: gid})
    }


    async function StartChat() {
        setInstagramProgressBar(true);
        setsendMessageScreen(false);
        setSearchUserScreen(false);


        console.log("Message Receivers ", selectedUser);

        if (selectedUser.length > 1) {
            //groupChat 
            // Create a group

            if (selectedUser.length > 0 && localStorage.getItem('fullname') && rs) {

                const payload: Group = {
                    admin: localStorage.getItem('fullname') as string,
                    participant: [...selectedUser, localStorage.getItem('fullname')] as string[]
                }

                webSocketMessage(rs as WebSocket, "createGroupChat", payload)
            }

        }
        else {

            //ordinary chat 
            console.log("OC");

            const payload = {
                participant: [...selectedUser, localStorage.getItem('fullname')],
                chatPresent: false  //chatPresent true bhi ho skta hai? firse logic change krna padega
            }

            var ordinaryChat: Response = await fetch('http://127.0.0.1:1769/api/v1/ordinaryChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })
            var data2: Peer2PeerChatType = await ordinaryChat.json();

            console.log("data ", data2);

            if (data2.success) {

                const Detail: Rookie | null = data2?.detail || null;

                if (Detail == null) {

                    return;
                }

                const name = Detail?.name || '';
                const profile = Detail?.profile || '';
                const participant = Detail?.parti || [{ username: '', fullname: '', profile: '' }];

                setMessageReceivers_FullDetail({ name: name, profile: profile, messages: [], groupChat: false, parti: participant });
                localStorage.setItem('MessageReceiver', participant[0].fullname)
                // name, profile, messages, isGroupChat, participant


                // var mess = ordinaryChat.messages;
                // console.log("mess-> ", mess);
                // var helper = []
                // for (let i = 0; i < mess.length; i++) {
                //     var obj = { content: mess[i].message, sender: mess[i].sender, receiver: mess[i].receiver };
                //     helper.push(obj);
                // }
                // console.log("Helper=> ", helper);
                // setChatMessages(helper);




            } else {

            }

        }

        setInstagramProgressBar(false);
    }


    async function ChangeGroupName() {
        setInstagramProgressBar(true);
        const id = localStorage.getItem('MessageReceiver');
        const new_GroupName = groupName;
        if (!id && !new_GroupName) {
            toast.dismiss();
            toast.error("Unable to change Group Name")
            return;
        }
        const packet: newGroupName = {
            id: id as string,
            newGroupName: new_GroupName as string
        }
        webSocketMessage(rs as WebSocket, "changeGroupName", packet)

    }

    // This function shows the menu to make a memeber admin (or remove as admin) and many more options
    async function GroupMemberSetting(event: any) {
        console.log("GroupMemberSetting");
        console.log("event ", event.type);
        console.log(event.currentTarget.id);
        setShowGroupSetting(true);
        setTakeAction(event.currentTarget.id);
        for (let i = 0; i < MessageReceivers_FullDetail.parti.length; i++) {
            if ((MessageReceivers_FullDetail.parti[i] as groupParticipantDetail).fullname === event.currentTarget.id) {
                console.log(event.currentTarget.id);
                console.log((MessageReceivers_FullDetail.parti[i] as groupParticipantDetail).admin);
                setIsAdmin((MessageReceivers_FullDetail.parti[i] as groupParticipantDetail).admin)
            }
        }
    }

    return (
        <div className='h-[100vh] w-[100vw] bg-black flex flex-col'>
            {
                InstagramProgress && <div className='relative h-[1%] w-[100%]'>
                    <ProgressBar />
                </div>
            }

            <div className="h-[100%] w-[100%] bg-black flex overflow-hidden relative">

                {/* Mandatory Renders */}

                <NavBar />

                <PreviouChatUser
                    setSearchUserScreen={setSearchUserScreen}
                    setsendMessageScreen={setsendMessageScreen}
                    setChatMessages={setChatMessages}
                ></PreviouChatUser>


                {

                    sendMessageScreen ?

                        (
                            <div className='w-[71%]  flex flex-col items-center justify-center gap-[0.5rem]'>
                                <div className='h-[6rem] w-[6rem]  rounded-full border-solid border-[3px] flex items-center justify-center'>
                                    <RiMessengerLine className='text-white text-[3rem]' />
                                </div>
                                <div className='text-white text-[1.5rem]'>Your messages</div>
                                <div className='text-white text-opacity-50'>Send private photos and messages to a friend or group</div>
                                <button className='text-white rounded-xl w-[8rem] h-[2rem] bg-blue-500' onClick={() => { setSearchUserScreen(true) }}>Send message</button>
                            </div>
                        )
                        :
                        (
                            <div className='w-[71%] flex overflow-hidden relative'>

                                <div className={`${userInfo ? ('w-[70%]') : ('w-[100%]')} transition-[width] text-white flex flex-col mt-[1%] gap-[1%] items-center `}>

                                    {/* User Detail-> username, fullname, profile, Blue tick */}
                                    <div className=' w-[100%] h-[9%] flex justify-between items-center border-b-[1px] border-white border-opacity-25 pl-[1rem] pr-[1rem] pb-[1rem]'>

                                        <div className='flex h-[100%] items-center justify-center gap-[1rem] '>
                                            <div className='h-[3rem] w-[3rem] rounded-full overflow-hidden' > <img src={MessageReceivers_FullDetail.profile} alt="pic" className='h-[100%] w-[100%]' /> </div>
                                            <div className='text-white'>{MessageReceivers_FullDetail.name}</div>
                                            {false && <VscVerifiedFilled className='text-blue-500  text-[1.5rem] relative left-[-0.8rem]' />}
                                        </div>

                                        {/* voice call, video call, info  */}
                                        <div className=' flex gap-[1rem] items-center mr-[0.5rem]'>
                                            <IoCallOutline className='text-white text-[1.5rem] cursor-pointer' />
                                            <HiOutlineVideoCamera className='text-white text-[1.5rem] cursor-pointer' />
                                            <AiOutlineInfoCircle className='text-white text-[1.5rem] cursor-pointer' onClick={() => {
                                                setUserInfo(!userInfo);
                                            }} />
                                        </div>

                                    </div>

                                    {/* message box */}
                                    <div className='pl-[1rem] pr-[1rem] gap-[1rem]  h-[80%] pb-[1rem] flex flex-col-reverse w-[100%]  overflow-y-auto overflow-x-hidden '>

                                        {
                                            [...chatMessages].reverse().map((indi, index) => {
                                                console.log("index ", index, " ", indi.sender);
                                                index++;
                                                return (

                                                    <div>
                                                        <div key={indi.id} className={`w-[100%]  flex  ${indi.sender === localStorage.getItem('fullname') ? ('justify-end pr-[1rem]') : ('justify-start pl-[1rem]')} `}>

                                                            <div className={`max-w-[50%] break-words  text-white text-[1.2rem] font-sans  pl-[0.5rem] pr-[0.5rem] rounded-xl my-[0.2rem] ${indi.sender === localStorage.getItem('fullname') ? ('bg-red-500') : ('bg-pink-400')}`}>{indi.content}</div>

                                                        </div>
                                                    </div>

                                                )
                                            })
                                        }


                                    </div>


                                    {/* message writing section */}
                                    <div className='ml-[1%] mr-[1%] h-[7%] rounded-3xl border-[1px] overflow-hidden w-[98%] flex  border-solid border-slate-800 bg-[rgba(33,33,33,1.0)] '>
                                        <div className='flex items-center  justify-center  h-[100%] w-[5%] rounded-2xl'>
                                            <BiSolidSmile className=' text-[1.5rem] ' />
                                        </div>
                                        <textarea value={TextMessage} onChange={HandleTextMessage} placeholder='enter a message' className='flex pt-[0.8rem]  focus:outline-none pl-[1rem] pr-[1.5rem] relative  bg-[rgba(33,33,33,1.0)] h-[100%]  w-[85%]  flex-wrap text-white rounded-2xl' />
                                        <button className='text-white h-[100%] w-[10%] hover:cursor-pointer bg-blue-500 rounded-2xl flex items-center justify-center' onClick={sendMessage}>Send</button>
                                    </div>

                                </div>

                                {
                                    userInfo &&

                                    <div className=' w-[30%] h-[100%] overflow-x-hidden overflow-y-auto border-l-[1px] border-[rgba(33,33,33,1.0)] border-solid  flex flex-col'>

                                        <div className='pl-[1rem] flex  flex-col gap-[1rem] border-b-[1px] border-[rgba(33,33,33,1.0)] pb-[2rem]'>
                                            <div className='text-white w-[100%] font-semibold text-[1.5rem] mt-[1.6rem]'>Details</div>

                                            {
                                                MessageReceivers_FullDetail.groupChat && <div className='mt-[1rem] flex items-center justify-between'>
                                                    <div className='text-white  text-[1rem] font-semibold'>Change Group Name</div>
                                                    <button className='text-white cursor-pointer w-[5.4rem] text-[1rem] h-[2rem] bg-[rgba(33,33,33,1.0)] mr-[1.5rem] rounded-lg'
                                                        onClick={() => { setChnagegroupNameWindow(true) }} >Change</button>
                                                </div>
                                            }

                                            <div>
                                                <div className='text-white mt-[0.5rem] font-semibold'>Mute messages</div>
                                            </div>
                                        </div>


                                        <div className='mt-[1rem]  flex flex-col  gap-[1rem]  border-b-[1px] border-[rgba(33,33,33,1.0)] pb-[2rem]'>

                                            <div className=' flex items-center justify-between '>
                                                <div className='text-white pl-[1rem]'>Members</div>
                                                {MessageReceivers_FullDetail.groupChat && <div className='text-blue-500 mr-[1.3rem] cursor-pointer'>Add people</div>}
                                            </div>


                                            {
                                                //if this true then it means chat is group chat otherwise ordinary chat
                                                !MessageReceivers_FullDetail.groupChat ?
                                                    (
                                                        <div className='text-white flex items-center gap-[1rem]'>
                                                            <div className='h-[3rem] w-[3rem] rounded-full overflow-hidden'>
                                                                <img src={(MessageReceivers_FullDetail?.parti[0]?.profile || '')} alt={MessageReceivers_FullDetail.parti[0].fullname} className='h-[100%] w-[100%]' />
                                                            </div>
                                                            <div className='flex flex-col'>
                                                                <div className='text-white'>{MessageReceivers_FullDetail.parti[0].fullname}</div>
                                                                <div className='text-white text-opacity-70 font-thin'>{MessageReceivers_FullDetail.parti[0].username}</div>
                                                            </div>
                                                        </div>
                                                    )
                                                    :
                                                    MessageReceivers_FullDetail.parti.map((indi: groupParticipantDetail | Genz) => {
                                                        return (

                                                            <div key={(indi?.username || '')} className='pl-[1rem] pt-[0.5rem] pb-[0.5rem] flex justify-between items-center hover:duration-300 hover:bg-[rgba(33,33,33,1.0)] '>

                                                                <div className='flex items-center gap-[1rem]'>
                                                                    <div className='h-[3rem] w-[3rem] rounded-full overflow-hidden'>
                                                                        <img src={indi?.profile || ''} alt={indi?.username || ''} className='h-[100%] w-[100%]' />
                                                                    </div>

                                                                    <div className='flex flex-col'>
                                                                        <div className='text-white'>{indi?.username || ''}</div>
                                                                        <div className='text-white text-opacity-70 font-thin'>
                                                                            {(indi as groupParticipantDetail)?.admin && <span>Admin <span className='relative bottom-[0.2rem]'>.&nbsp;&nbsp;</span> </span>}
                                                                            {indi?.fullname || ''}</div>
                                                                    </div>
                                                                </div>

                                                                {
                                                                    (indi as groupParticipantDetail).mainAdmin === localStorage.getItem('fullname') &&   indi.fullname !== localStorage.getItem('fullname') ?
                                                                    <HiOutlineDotsVertical id={indi.fullname || ''} className='text-white mr-[2rem] cursor-pointer text-opacity-90 hover:cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 transition-all' onClick={GroupMemberSetting} />
                                                                    :
                                                                    ((indi?.fullname || '') !== localStorage.getItem('fullname') && !(indi as groupParticipantDetail).admin)  && 
                                                                    <HiOutlineDotsVertical id={indi.fullname || ''} className='text-white mr-[2rem] cursor-pointer text-opacity-90 hover:cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 transition-all' onClick={GroupMemberSetting} />
                                                                }

                                                            </div>

                                                        )
                                                    })
                                            }


                                        </div>

                                        {
                                            MessageReceivers_FullDetail.groupChat ?
                                                (<div className='flex flex-col pl-[1.2rem]'>
                                                    <div className='text-red-500 mt-[1.5rem]  cursor-pointer mb-[1rem] text-opacity-80'>Leave chat</div>
                                                    <div className='text-white text-opacity-80 font-normal text-[0.9rem]'>You won't get messages from this group unless</div>
                                                    <div className='text-white text-opacity-80 font-normal text-[0.9rem]'>someone adds you back to the chat</div>
                                                </div>)
                                                :
                                                (
                                                    <div className='flex flex-col pl-[1.2rem]'>
                                                        <div className='text-red-500 mt-[1.5rem]  cursor-pointer mb-[1rem] text-opacity-80'>Report</div>
                                                        <div className='text-red-500 mt-[1.5rem]  cursor-pointer mb-[1rem] text-opacity-80'>Block</div>
                                                    </div>
                                                )
                                        }

                                        <div className='text-red-500 mt-[1.5rem]  cursor-pointer mb-[1rem] pl-[1.2rem] text-opacity-80'>Delete chat</div>





                                    </div>
                                }


                            </div>
                        )
                }



                {/* Conditional Render */}

                {
                    searchUserScreen &&
                    <div className='h-[100vh] flex items-center justify-center w-[100vw] absolute bg-[rgba(0,0,0,0.4)] backdrop-blur-[2px]'>

                        <div className='bg-[rgba(33,33,33,1.0)] h-[28rem] absolute w-[33rem] rounded-2xl z-[5]'>

                            {/* Heading & closing stuff */}
                            <div className='flex items-center justify-center pt-[0.2rem]'>
                                <div className='text-[1.2rem] text-white'>New message</div>
                                <RxCross2 className='text-white text-[1.4rem] relative left-[10rem] top-[0.2rem] cursor-pointer' onClick={CloseSearchUserWindow} />
                            </div>

                            {/* Search Bar to search user */}
                            <div className='flex mt-[1rem] pl-[4%]  h-[3rem] border-t-[1px] border-b-[1px] border-gray-700'>
                                <div className='text-white text-[1.4rem]  flex items-center justify-center'>To: </div>
                                <input value={userToSearchinDB} onChange={SearchinDB} type='text' className='bg-[rgba(33,33,33,1.0)] text-white pl-[1rem] w-[100%] focus:outline-none' placeholder='search'></input>
                            </div>

                            {/* Searched users details */}
                            <div className='relative h-[65%] overflow-y-auto overflow-x-hidden text-white pt-[1rem] pl-[1rem] '>
                                {
                                    !emptySearchBar && db_ack_userDetail.map((indi) => {
                                        return (
                                            <div key={indi.username} className='relative mb-[1rem] h-[20%] w-[100%]  hover:cursor-pointer' >

                                                <div className=' mb-[1rem] h-[100%] absolute w-[100%] flex items-center justify-between pr-[1rem]'>
                                                    <div className='flex gap-[1.3rem] items-center justify-center'>
                                                        <div className='h-[3rem] w-[3rem] rounded-full overflow-hidden'> <img src={indi.profile} alt="profile" className='h-[100%] w-[100%]' /> </div>
                                                        <div className='flex flex-col'>
                                                            <div className='text-white text-opacity-50'>{indi.fullname}</div>
                                                            <div className='text-white text-opacity-50'>{indi.username}</div>
                                                        </div>
                                                    </div>

                                                    <div className='h-[1rem] flex items-center justify-center w-[1rem] border-[1px] border-white rounded-full'>
                                                        <div className={`h-[0.5rem] w-[0.5rem] rounded-full ${indi.select && ('bg-blue-600')} `}> </div> {/*Blue selector*/}
                                                    </div>
                                                </div>

                                                <div id={indi.fullname} className={`h-[100%] w-[100%] absolute`} onClick={SelectThisUser}></div>

                                            </div>

                                        )
                                    })
                                }
                            </div>

                            {/* Start Chat Button */}
                            <div className='text-white h-[3rem] w-[100%] relative flex items-center justify-center'>
                                <div className='bg-blue-500  rounded-xl w-[80%] h-[80%] flex items-center justify-center cursor-pointer' onClick={StartChat}>chat</div>

                                {(!activeChatButton && selectedUser.length === 0) && <div className=' w-[80%] h-[80%] absolute bg-[rgba(0,0,0,0.6)] rounded-xl'> </div>}

                            </div>


                        </div>

                    </div>

                }




                {
                    changeGroupNameWindow &&
                    <div className='h-[100vh] absolute w-[100vw]  flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-[2px]'>

                        <div className='bg-[rgba(33,33,33,1.0)] h-[16rem] absolute w-[28rem] rounded-2xl z-[5]'>

                            <div className='flex items-center justify-center pt-[1rem] border-b-[1px] border-white border-opacity-30 pb-[0.8rem]'>
                                <div className='text-[1.2rem] text-white'>Change group Name</div>
                                <RxCross2 className='text-white text-[1.4rem] relative left-[6rem] top-[0.2rem] cursor-pointer'
                                    onClick={() => {
                                        setChnagegroupNameWindow(false);
                                        setChaneGroupName(MessageReceivers_FullDetail.name)
                                    }} />
                            </div>

                            <div className='text-white pl-[1rem] pr-[0.5rem] pt-[0.5rem]' >Changing the name of a group chat changes it for everyone.</div>

                            <div className='flex items-center justify-center pt-[1rem]'>
                                <input
                                    value={groupName}
                                    type='text' className='w-[80%] h-[3rem] rounded-lg bg-transparent border-[1px] border-white border-opacity-25 focus:outline-none text-white pl-[1rem]'
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        console.log("value", e.currentTarget.value);
                                        setChaneGroupName(e.currentTarget.value);
                                    }}>
                                </input>
                            </div>

                            <div className='flex items-center justify-center pt-[1rem] text-white'>
                                <button className='w-[80%] bg-blue-500 h-[2.5rem] rounded-lg' onClick={ChangeGroupName}>Save</button>
                            </div>

                        </div>
                    </div>
                }






            </div>

            {
                ShowGroupSetting &&
                <div className='h-[100vh] w-[100vw] absolute bg-[rgba(0,0,0,0.6)] backdrop-blur-[2px] flex justify-center items-center'>
                    <div className='h-[30%] w-[27%]  bg-[rgba(33,33,33,1.0)] rounded-lg flex flex-col'>
                        <div className='h-[25%] flex justify-center border-b-[1px] cursor-pointer border-b-[rgba(64,64,64)] items-center w-[100%] text-red-500 font-semibold'>Remove from group</div>
                        {
                            isAdmin ?
                                <div className='h-[25%] flex justify-center border-b-[1px] cursor-pointer border-b-[rgba(64,64,64)] items-center w-[100%] text-white text-opacity-80' onClick={RemoveAsAdmin}>Remove as Admin</div>
                                :
                                <div className='h-[25%] flex justify-center border-b-[1px] cursor-pointer border-b-[rgba(64,64,64)] items-center w-[100%] text-white text-opacity-80' onClick={MakeAdmin}>Make admin</div>
                        }
                        <div className='h-[25%] flex justify-center border-b-[1px] cursor-pointer border-b-[rgba(64,64,64)] items-center w-[100%] text-white text-opacity-80'>Block</div>
                        <div className='h-[25%] flex justify-center items-center w-[100%] text-white text-opacity-80 cursor-pointer' onClick={() => { setShowGroupSetting(false) }}>Cancel</div>
                    </div>
                </div>
            }
        </div>

    );
}

export default Message;