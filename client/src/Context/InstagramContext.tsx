import { atom, selector } from "recoil";
import { ChatsType } from "@ayush/ui/dest/ApiControllerTypes";
import { loginDetailType,  Debris } from '@ayush/ui/dest/ContextTypes';


export const doIFollowThisGuyState = atom({
  key: "doIFollowThisGuyState",
  default: false
});

export const setChatListState = atom<ChatsType[]>({
  key: 'setChatListState',
  default: []
})


export const formTypeState = atom({
  key: "formTypeState",
  default: "login",
});

export const inValidPasswordState = atom({
  key: "inValidPasswordState",
  default: false,
});

export const createSectionState = atom({
  key: "createSectionState",
  default: false,
});

export const loaderState = atom({
  key: "loaderState",
  default: false,
});

export const showOnlyLogo = atom({
  key: 'showOnlyLogo',
  default: false
})

export const loginDetailRecoil = atom<loginDetailType>({
  key: "loginDetailRecoil",
  default: {
    username: "",
    fullname: "",
    password: "",
    profile: '../Assets/defaultProfile.png',
    post: 0,
    following: 0,
    followers: 0,
    bio: "",
  },
});

export const searchedUserState = atom({
  key: "searchedUserState",
  default: {
    username: "",
    fullname: "",
    profile: '../Assets/defaultProfile.png',
    post: 0,
    following: 0,
    followers: 0,
    bio: "",
  },
});

export const checkLoginStatusState = selector({
  key: "checkLoginStatusState",
  get: () => {
    return async () => {
      const respone = await fetch('http://127.0.0.1:1769/api/v1/isLoggedin', {
        method: "POST",
        credentials: 'include',

      })
      const data = await respone.json();
      console.log("auth data-> ", data);
      if (data.success) {
        console.log("true");
        return true;
      }
      return false;
    };
  },
});

export const webSocketRef = atom<WebSocket|null>({
  key: "webSocketRef",
  default: null
})

export const MessageReceiversState = atom<string[]>({
  key: "MessageReceiversState",
  default: []
})

export const MessageReceivers_FullDetailState = atom<Debris>({
  key: "MessageReceivers_FullDetailState",
  default: {name: '', profile: '', messages: [], groupChat: false, parti: []}
})

export const setChaneGroupNameState = atom<string>({
  key: "setChaneGroupNameState",
  default: ''
})

export const ChatMessagesState = atom({
  key: 'setChatMessagesState',
  default: []
})


export const InstagramProgressBar = atom({
  key: 'InstagramProgressBarState',
  default: false
})




