//logical error 
// when there is no chat between user
// large number of chats is being created 
// error in priyam simalti in monogo





import { sendMessagePacket, chatDetail, Group, receiveMessagePacket, newGroupName, PacketType } from "@ayush/ui";
import { connection } from "websocket";
import { Message } from "../Schema/Message";
import { User } from "../Schema/UserDetail";
import { ChatsType, Genz } from "@ayush/ui/dest/ApiControllerTypes";

export async function HandleMessages(parsedData: sendMessagePacket, UserToConnection: Map<string, connection>) {
    console.log("HandleMessage");
    // console.log(parsedData);
    const chat = parsedData.packet as chatDetail
    if (chat?.chatType === "oc") {
        // Ordinary Chat
        HandleOridnaryMessage(parsedData, UserToConnection);
    } else {
        // Group Chat
        HandleGroupMessage(parsedData.packet as chatDetail, UserToConnection)
    }
}

async function HandleOridnaryMessage(parsedData: sendMessagePacket, UserToConnection: Map<string, connection>) {

    var chatPacket = parsedData.packet as chatDetail
    console.log(chatPacket);
    const receiver: string = chatPacket.receiver[0]; //receiver will contain the name of that user jsiko message bhej rhae hai
    const sender: string = chatPacket.sender;
    var SenderDetail, receiverDetail;
    const participant = [chatPacket?.sender, chatPacket?.receiver[0]];
    let createChat = null, findChat = null;

    if ((chatPacket as chatDetail & { newChat?: boolean }).newChat) {
        // Chat does not exist
        console.log("Chat does not exist");
        console.log("participant-> ", participant);

        // Creating chat
        createChat = await Message.create({
            users: participant,
            content: [{ sender: chatPacket.sender, message: chatPacket.content, receiver: chatPacket.receiver[0] }],
            groupChat: false
        });

        SenderDetail = await User.findOne({ fullname: sender });
        let chats = SenderDetail.chat;

        chats.unshift({ name: receiver, unseen: 0, chatType: "oc" });
        SenderDetail = await User.findOneAndUpdate({ fullname: sender }, { chat: chats }, { new: true });

        receiverDetail = await User.findOne({ fullname: receiver });



    } else {
        console.log("Chat already exist ", receiver);
        console.log("participant ", participant);
        receiverDetail = await User.findOne({ fullname: receiver });
        SenderDetail = await User.findOne({ fullname: sender });
        findChat = await Message.findOne({ users: { $all: participant }, groupChat: false });
        let obj: {} = { sender: sender, receiver: receiver, message: chatPacket.content }
        // console.log(findChat);
        if (findChat) {
            let chats = findChat.content;
            console.log(chats);
            chats.push(obj);
            findChat = await Message.findOneAndUpdate({ users: { $all: participant }, groupChat: false }, { content: chats }, { new: true });
        }

    }


    var packet: ChatsType = {
        name: receiverDetail.fullname,
        profile: receiverDetail.profile,
        type: "oc",
        gid: receiverDetail.fullname,
        useenCount: 0
    }

    //updating frontend chatList (in prevChatUser) of sender
    var conn = UserToConnection.get(sender);
    conn?.send(JSON.stringify({ query: "updateChatList", packet: packet }))




    if (createChat) {
        let chat = createChat.content;
        chatPacket.id = chat[chat.length - 1]._id

    } else if (findChat) {
        let chat = findChat.content;
        chatPacket.id = chat[chat.length - 1]._id
    }


    var chats = receiverDetail.chat;
    var unseenCount = 1;

    //re arranging chat list of receiver -> Chat list contain fullname of all that users with whom user have a chat history
    for (let i = 0; i < chats.length; i++) {
        if (chats[i].name === sender) {
            var save = chats[i];
            chats.splice(i, 1);
            save.unseen++;
            unseenCount = save.unseen;
            chats.unshift(save);
            receiverDetail = await User.findOneAndUpdate({ fullname: receiver }, { chat: chats }, { new: true });
            break;
        } else if (i === chats.length - 1) {
            chats.unshift({ name: sender, unseen: 1, chatType: "oc" });
            receiverDetail = await User.findOneAndUpdate({ fullname: receiver }, { chat: chats }, { new: true });
        }
    }

    // This packet contain the detail of user who should be on top of the ChatList
    var packet: ChatsType = {
        name: SenderDetail.fullname,
        profile: SenderDetail.profile,
        type: "oc",
        gid: SenderDetail.fullname,
        useenCount: unseenCount
    }

    var conn = UserToConnection.get(receiver);
    conn?.send(JSON.stringify({ query: "updateChatList", packet: packet }))

    if (receiver !== undefined) {
        const conn = UserToConnection.get(receiver);

        const ResponsePacket: receiveMessagePacket = {
            query: "message",
            packet: chatPacket
        }



        conn?.send(JSON.stringify(ResponsePacket))
    }

}

async function HandleGroupMessage(packet: chatDetail, UserToConnection: Map<string, connection>) {
    //In Case of GroupChat the receiver will be all the participant in the group, but value of receiver in Packet will gid of group 
    console.log("Group Chat Messages ", packet);
    var onlineUser: connection[] = []

    for(let  i =0; i<packet.receiver.length; i++){

        var isThisUserActive = packet.receiver[i];
        if(isThisUserActive === packet.sender){
            continue;
        }

        // INC

    }
  


}

export async function HandleZeroUneenMessage(parsedData: sendMessagePacket, UserToConnection: Map<string, connection>) {
    console.log("HandleZeroUneenMessage");
    console.log(parsedData.packet);
    const packet: { myName: string; sender: string, type: string } = parsedData.packet as { myName: string; sender: string, type: string };
    let findMyData = await User.findOne({ fullname: packet.myName })
    let chats = findMyData.chat;

    for (let i = 0; i < chats.length; i++) {
        if (chats[i].chatType === packet.type && chats[i].name === packet.sender) {
            chats[i].unseen = 0;
            break;
        }
    }

    findMyData = await User.findOneAndUpdate({ fullname: packet.myName }, { chat: chats });


}

export async function createGroupChat(parsedData: Group, UserToConnection: Map<string, connection>) {
    console.log(parsedData);
    const { admin, participant } = parsedData;
    console.log(admin);
    console.log(participant);


    try {

        const Group = await Message.create({ users: participant, groupChat: true, mainAdmin: admin, admins: [admin] });

        for (let i = 0; i < participant.length; i++) {
            const save = participant[i];
            const Update = await User.findOneAndUpdate(
                { fullname: save },
                {
                    $push: {
                        chat: {
                            $each: [{ name: Group.id, useen: 0, chatType: "gc" }],
                            $position: 0 // This specifies the position to insert (0 means at the beginning)
                        }
                    }
                }
            );
        }

        console.log("New Group Detail ", Group);

        const participantDetails: Genz[] = []

        for (let i = 0; i < participant.length; i++) {
            const user = participant[i];
            const Detail = await User.findOne({ fullname: user });
            participantDetails.push({ username: Detail.username, fullname: Detail.fullname, profile: Detail.profile })
        }
        
        console.log();

        for (let i = 0; i < participant.length; i++) {
            var con = UserToConnection.get(participant[i]);
            const ResponsePacket: receiveMessagePacket = {
                query: "groupCreated",
                packet: {
                    groupDetail: { name: Group.groupName, profile: Group.groupProfile, messages: [], groupChat: true, parti: participantDetails },
                    id: Group._id
                }
            }
            con?.send(JSON.stringify(ResponsePacket))

        }


    } catch (e) {

        console.log(e);
       

    }


}

export async function  changeGroupName(parsedData: newGroupName, UserToConnection: Map<string, connection>) {
    const {id, newGroupName} = parsedData;
    console.log("GroupId ", id);
    console.log("GroupId ", newGroupName);
    const GroupDetail = await Message.findOneAndUpdate({_id: id}, {groupName: newGroupName}, {new: true});
    if(GroupDetail?.groupName === newGroupName){
        for(let i=0; i<GroupDetail.users.length; i++){
            const user = GroupDetail.users[i];
            const con = UserToConnection.get(user);
            con?.send(JSON.stringify({query: "groupNameChanged", packet: parsedData}));
        }
    }
}

export async function MakeGroupAdmin(parsedData: {fullname: string, gid: string}, UserToConnection: Map<string, connection>) {
    // parsedData.fullname contain name of that user whom we want to make admin, gid: contain group id, 
    console.log("make-group-admin");   
    console.log(parsedData);
    const resp = await Message.findByIdAndUpdate({_id: parsedData.gid}, { $push: {admins:parsedData.fullname} }, {new: true} )
    console.log("new admin-> ",resp?.admins);
    // UserToConnection.get(parsedData.connectionUser)?.send( JSON.stringify({query:'make-group-admin', packet: {success: true, newAdmin: parsedData.fullname} }) )
    var size = 0;
    if(resp?.admins!==undefined){
        size = resp.admins.length;
    }
    for(let i=0; i<size; i++){
        UserToConnection.get(resp?.admins[i] as string)?.send( JSON.stringify({query:'make-group-admin', packet: {success: true, newAdmin: parsedData.fullname} }))
    }
}

export async function removeGroupAmdin(parsedData: {fullname: string, gid: string}, UserToConnection: Map<string, connection>){
    console.log("Remove group admin")
    console.log(parsedData);
    var resp = await Message.findById({_id: parsedData.gid});
    const adminsList: string[] = resp?.admins || [];
    for(let i=0; i<adminsList.length; i++){
        if(adminsList[i] === parsedData.fullname){
            adminsList.splice(i,1);
            break;
        }
    }
    console.log("New admin list ", adminsList);
    resp = await Message.findByIdAndUpdate({_id: parsedData.gid}, {admins: adminsList}, {new: true});
    console.log("Updated data ", resp);
    
    for(let i=0; i< (resp?.users.length || 0) ; i++){
        UserToConnection.get((resp?.users as string[])[i])?.send(JSON.stringify({query: "removed-as-admin", packet: {fullname: parsedData.fullname}}))
    }

}