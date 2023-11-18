import React, { useEffect } from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { PiNotePencilThin } from 'react-icons/pi'
import { useRecoilState, useSetRecoilState } from 'recoil';
import { InstagramProgressBar,  MessageReceivers_FullDetailState, setChaneGroupNameState, setChatListState, } from '../Context/InstagramContext';
import { ChatsType, GroupType, Peer2PeerChatType, RecentChatsType, Rookie } from '@ayush/ui/dest/ApiControllerTypes';
import { Debris } from '@ayush/ui/dest/ContextTypes';

type propsType = {
    setSearchUserScreen: React.Dispatch<React.SetStateAction<Boolean>>,
    setsendMessageScreen: React.Dispatch<React.SetStateAction<Boolean>>,
    setChatMessages: React.Dispatch<React.SetStateAction<any[]>>
}

function PreviouChatUser({ setSearchUserScreen, setsendMessageScreen, setChatMessages }: propsType) {
    
    const [InstagramProgress, setInstagramProgressBar] = useRecoilState(InstagramProgressBar)


    var [ChatList, setChatList] = useRecoilState(setChatListState)// profile: '', name: '', type (group or ordinary): '', gid: (in case of a group, groupid)
    const changeGroupName = useSetRecoilState(setChaneGroupNameState);

    // const [MessageReceivers, setMessageReceivers] = useRecoilState(MessageReceiversState); //this contain username of all the selected user with whom client want to have conversation
    const setMessageReceivers_FullDetail = useSetRecoilState(MessageReceivers_FullDetailState) //this contain all the detail of users which are inside "MessageReceivers"


    async function RecentChats() {

        var response: Response = await fetch('http://127.0.0.1:1769/api/v1/RecentChatsUser', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fullname: localStorage.getItem('fullname') })
        })
        const data: RecentChatsType = await response.json();
        console.log("data ", data);
        const dummy: ChatsType[] = [{ name: '', profile: '', type: '', gid: '', useenCount: 0 }]

        if (data.success) {

            var saver: ChatsType[] = [];
            const allChats: ChatsType[] = [...(data?.chatHistory || dummy)]
            console.log("AllChats ", allChats);
            for (let i = 0; i < allChats.length; i++) {

                const ptr: ChatsType = allChats[i];
                const obj: ChatsType = { name: ptr.name, profile: ptr.profile, type: ptr.type, gid: ptr.gid, useenCount: ptr.useenCount };

                // In groupChat-> gid contain id of groupChat, which is used to identify the group in backend
                // In OrdinayChat-> gid contain fullname of receiver   

                if (obj.name === '') {
                    continue;
                }

                saver.push(obj)

            }
            console.log("saver ", saver);
            setChatList(saver)
            localStorage.setItem('ChatList', JSON.stringify(saver))

        }



    }


    useEffect(() => {
        console.log("CL", ChatList);
        localStorage.setItem('MessageReceiver', JSON.stringify([]))
        RecentChats();
    }, [])

    useEffect(() => {
        console.log("CL", ChatList);
    }, [ChatList])

    async function OpenChats(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        
        setInstagramProgressBar(true);
        console.log("openChats ", event.currentTarget.id);
        setChatMessages([])
        setsendMessageScreen(false);
        setSearchUserScreen(false);
        const arr = event.currentTarget.id.split('|');
        const chatType = arr[0];
        console.log(arr);

        setChatList((prev: ChatsType[]) => {

            let save: ChatsType[] = [];

            for (let i = 0; i < prev.length; i++) {
                if (prev[i].name !== arr[1]) {
                    save.push(prev[i]);
                } else {
                    save.push({ name: prev[i].name, gid: prev[i].gid, profile: prev[i].profile, type: chatType, useenCount: 0 });
                }
            }

            console.log("newPrev", save);
            console.log("\n\n\n\n\n\n");

            return [...save];
        })

        if (chatType === "gc") {
            // Group Chat
            console.log("Group Chat");
            const payload = {
                // admin: localStorage.getItem('fullname'),
                gid: arr[1]
            }

            let createGroup: Response = await fetch('http://127.0.0.1:1769/api/v1/getGroupInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            let data: GroupType = await createGroup.json();

            console.log("GROUPdata ", data);

            if (data.success) {
                var groupDetail: Rookie | null = data.groupDetail || null

                if (!groupDetail) {
                    console.log("GroupDetail is null");
                    return;
                }

                let obj: Debris = {
                    name: groupDetail.name ?? '',
                    profile: groupDetail.profile ?? '',
                    messages: [],
                    groupChat: true,
                    parti: groupDetail.parti
                }

                setMessageReceivers_FullDetail(obj);
                changeGroupName(obj.name)
                localStorage.setItem('groupName', JSON.stringify(obj.name))

                let helper: string[] = [];
                for (let i = 0; i < (obj.parti?.length || 0); i++) {

                    if (!obj.parti) {
                        break;
                    }

                    helper.push(obj.parti[i].username || '')
                }
                //Inc
                let save: string;
                if(data.id===undefined){
                    save='';
                } else{
                    save = data.id as string;
                }
                localStorage.setItem('MessageReceiver', save)

            }
        }
        else {
            //Ordinary Chat
            console.log("Oridinary Chat ", arr[1]);
            // setMessageReceivers([arr[1]]);
            const payload = {
                participant: [arr[1], localStorage.getItem('fullname')],
                chatPresent: true
            }
            var ordinaryChat: Response = await fetch('http://127.0.0.1:1769/api/v1/ordinaryChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })
            let data: Peer2PeerChatType = await ordinaryChat.json();

            if (data.success) {

                const Detail: Rookie | null = data?.detail || null;
                console.log("Detail ", Detail);

                if (Detail == null) {
                    return;
                }

                const name = Detail?.name || '';
                const profile = Detail?.profile || '';
                const participant = Detail?.parti || [{ username: '', fullname: '', profile: '' }];

                setMessageReceivers_FullDetail({ name: name, profile: profile, messages: [], groupChat: false, parti: participant });
                localStorage.setItem('MessageReceiver', participant[0].fullname)
                // name, profile, messages, isGroupChat, participant


                if (typeof (Detail.messages)) {

                    let mess: { message: string, sender: string, receiver: string, id: string }[] = Detail.messages as { message: string, sender: string, receiver: string, id: string }[];
                    // console.log("mess-> ", mess, mess[0].id);
                    
                    var helper: { content: string, sender: string, receiver: string, id: string }[] = []
                    
                    for (let i = 0; i < mess.length; i++) {
                        var obj: { content: string, sender: string, receiver: string, id: string } = { content: mess[i].message, sender: mess[i].sender, receiver: mess[i].receiver, id:mess[i].id };
                        helper.push(obj);
                    }

                    console.log("Helper=> ", helper);
                    setChatMessages(helper);

                }

            } else {

            }


            // if (data.success) {

            //     console.log("ordinary Chat ", ordinaryChat);
            //     localStorage.setItem('MessageReceiver', arr[1])

            //     setMessageReceivers_FullDetail([ordinaryChat.name, ordinaryChat.profile, [], false, ordinaryChat.participant,]);

            //     var mess = ordinaryChat.messages;
            //     console.log("mess-> ", mess);
            //     var helper = []
            //     for (let i = 0; i < mess.length; i++) {
            //         var obj = { content: mess[i].message, sender: mess[i].sender, receiver: mess[i].receiver };
            //         helper.push(obj);
            //     }
            //     console.log("Helper=> ", helper);
            //     setChatMessages(helper);
            // } else {
            //     // Under Dev
            // }

        }

        setInstagramProgressBar(false);

    }

    return (
        <div className='w-[24%] flex flex-col pt-[2.3rem]  border-r-[1px] border-solid border-[rgba(97,97,97,1.0)]'>

            <div className='flex pl-[1rem]  justify-between items-center'>

                <div className='flex items-center justify-center gap-[0.5rem]'>
                    <div className='text-white text-[1.3rem]'>{localStorage.getItem('username')}</div>
                    <BiChevronDown className='text-white' />
                </div>

                <PiNotePencilThin className='cursor-pointer text-red-900 font-medium relative mr-[1rem] text-[2rem]' onClick={() => {
                    setChatMessages([]);
                    setSearchUserScreen(true);
                }} />
            </div>

            <div className='w-[100%] pl-[1rem] flex mt-[2rem] justify-between items-center  pr-[0.6rem]'>
                <div className=' text-white  cursor-pointer'>Messages</div>
                <div className='cursor-pointer text-white  text-opacity-60'>Request</div>
            </div>

            <div className='h-[85%] overflow-y-auto overflow-x-hidden w-[100%]  pt-[1rem] flex flex-col gap-[0.5rem] '>
                {
                    ChatList.length > 0 && ChatList.map((indi) => {
                        console.log("Message Receiver ", localStorage.getItem('MessageReceiver'), indi.gid);
                        return (
                            <div key={indi.name} className={`relative w-[100%] h-[5rem] flex items-center 
                            ${localStorage.getItem('MessageReceiver') === indi.name && 'bg-[rgba(33,33,33,1.0)]'}
                            ${localStorage.getItem('MessageReceiver') === indi.gid && 'bg-[rgba(33,33,33,1.0)]'}

                            ${localStorage.getItem('MessageReceiver') !== indi.name && 'hover:bg-[#0e0d0d]'} `}>

                                <div className={`flex items-center h-[4rem] pl-[1rem] gap-[1rem] } w-[100%]  `}>
                                    <div className='h-[3rem] w-[3rem] rounded-full overflow-hidden'> <img src={indi.profile} alt="sss" className='text-white h-[100%] w-[100%]' /> </div>
                                    <div className='flex flex-col'>
                                        <div className='text-yellow-400'>{indi.name}</div>
                                        {indi.useenCount !== 0 && <div className='text-white font-semibold'> {(indi.useenCount || 0).toString()} new Message</div>}
                                    </div>
                                </div>

                                <div
                                    id={`${indi.type}|${indi.gid}`} className={`h-[100%] w-[100%] absolute cursor-pointer`}
                                    onClick={OpenChats}>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    );
}

export default PreviouChatUser;