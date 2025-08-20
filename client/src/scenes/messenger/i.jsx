import React from 'react';
import { Box, useMediaQuery,  InputBase , useTheme} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import './index.css';
import Navbar from "../navbar/index";
import CreateGroupForm from '../../components/CreateGroupForm';
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import FriendListWidget from '../widgets/FriendListWidget';
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { io } from "socket.io-client";
import WidgetWrapper from '../../components/WidgetWrapper';
import setOnlineUsers from "../../state"


const Messenger = () => {

    const token = useSelector((state) => state.token);
    const dispatch = useDispatch();
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [onlineUserslocal, setOnlineUserslocal] = useState([]);
    const socket = useRef();
    const inputRef = useRef();
    const user = useSelector((state) => state.user);
    const friends = useSelector((state) => state.user.friends);
    const mode = useSelector((state)=> state.mode )
    const isNonMobileScreens=useMediaQuery('(min-width:1000px)');
    const {_id} = useSelector((state)=>state.user)
    const scrollRef = useRef();
    //const scrollRefee = useRef();
    const [scroll, setScroll] = useState(false);
    const {palette} = useTheme();
    const [isGroupCreated, setIsGroupCreated] = useState(false);
    const [key, setKey] = useState('');
    const [isSearched, setIsSearched] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [conversationIds, setConversationIds] = useState([]);
    
    useEffect(() => {
      socket.current = io("ws://localhost:8900");
      socket.current.on("getMessage", (data) => {
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,
          createdAt: Date.now(),
        });
      });
    }, []);// eslint-disable-next-line
  
    useEffect(() => {
      arrivalMessage && 
        currentChat?.members.includes(arrivalMessage.sender) &&
        setMessages((prev) => [...prev, arrivalMessage]);
        if (inputRef.current) {
          console.log(inputRef.current); // Ensure this logs the <input> DOM node
          inputRef.current.focus(); // Focus the input field
        }
    }, [arrivalMessage, currentChat ]);
  
    useEffect(() => {
      socket.current.emit("addUser", _id);
    
      const handleGetUsers = (users) => {
        setOnlineUserslocal(users);
       //dispatch(setOnlineUsers(users)); // Dispatch the full list of users
      };
    
      socket.current.on("getUsers", handleGetUsers);
    
      return () => {
        socket.current.off("getUsers", handleGetUsers); // Cleanup listener
      };
    }, [_id]);
    
const handleSearch = async () => {
  const response = await fetch(process.env.REACT_APP_SERVER+`/users/reveal_all_users`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  setAllUsers(data.filter(user => user._id !== _id));
};

useEffect(() => {
  handleSearch();
}, []);

useEffect(() => {
  if(key.trim()){
  const searchKey = key.toLowerCase();
  const searchResult = allUsers.filter((user) => {
    return (
      user.firstName.toLowerCase().includes(searchKey) ||
      user.lastName.toLowerCase().includes(searchKey)
    );
  });
  setFilteredUsers(searchResult);
 // console.log('filtered : ',filteredUsers)
 }
}, [key, allUsers]);

useEffect(() => {
  const allIds = filteredUsers.map(user => user._id);
  const searchIdSpace = [...allIds,_id]
  console.log(searchIdSpace,conversations)

  const matchingConversations = conversations
    .filter(c => c.members.every(memberId => searchIdSpace.includes(memberId )));
  setConversationIds(matchingConversations);

  console.log('matched : ',matchingConversations);
  setConversations(matchingConversations);
  console.log('After Searching  : ',conversations);
}, [filteredUsers]); 

useEffect(() => {
  const getConversations = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER+`/api/conversations/${_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      // Sort conversations by updatedAt in descending order (latest first)
      const sortedConversations = data.sort((a, b) => new Date(b.updatedAt)- new Date(a.updatedAt) );
      setConversations(sortedConversations);
      //console.log(sortedConversations)
    } catch (err) {
      console.log(err);
    }
  };
  

  if (_id) {
    getConversations();
  }
}, []);

    const getMessages = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+"/api/messages/" + currentChat?._id , {
          method : "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setMessages(data);
        //console.log('msgs : ',data)
      } catch (err) {
        console.log(err);
      }
    };

    const markMessagesAsRead = async () => {
      await getMessages();
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+`/api/messages/unread/${currentChat._id}/${_id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to fetch unread messages");
        }
    
        const unreadMessages = await response.json();
     // Mark each message as read
        for (const umsg of unreadMessages) {
          const bodyOfReq = {
            messageId: umsg?._id || null,
            userId: _id,
            conversationId: currentChat._id,
          };
    
          try {
            await fetch(process.env.REACT_APP_SERVER+`/api/messages/markAsRead`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(bodyOfReq),
            });
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    useEffect(() => {
      if (currentChat) {
        getMessages();
       }
    }, [currentChat,arrivalMessage]);
    
  
    const handleSubmit = async () => {
      const message = {
        conversationId: currentChat._id,
        sender: _id ,
        text: newMessage,
        readBy : _id,
      };
  
      const receiverId = currentChat.members.filter(
        (member) => member !== _id
      );
  
      socket.current.emit("sendMessage", {
        senderId: _id,
        receiverId,
        text: newMessage,
      }
      );
  //MESSAGE SENT LOGIC :
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+"/api/messages/" , {
          method : "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
           
          },
          body:JSON.stringify(message),
        });
        const data = await response.json();
        setMessages([...messages, data]);
        //console.log('Message Sent :-\nmessage : ',message,'response : ',response ,'\ndata : ',data,'Updates Messages Array : ',messages);
        setNewMessage("");
      } catch (err) {
        console.log(err);
      }



    };
  
    useEffect(() => {
      if(currentChat  ){
      console.log('Scroll into View',currentChat, scrollRef.current,arrivalMessage)
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      console.log(scrollRef.current)
    }
    }, [currentChat, scrollRef.current,arrivalMessage]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            markMessagesAsRead();
          }
        },
        {
          root: null, // viewport
          threshold: 1.0, // Fully in view
        }
      );
  
      // Observe the last message in the list
      if (scrollRef.current) {
        observer.observe(scrollRef.current);
      }
  
      return () => {
        if (scrollRef.current) {
          observer.unobserve(scrollRef.current);
        }
      };
    }, [messages, currentChat]);
    
    

  const handleGroupCreate = async (group)=>{
    //console.log(group)
    setCurrentChat(null);
    setIsGroupCreated(!isGroupCreated)
    try {

      const response = await fetch(process.env.REACT_APP_SERVER+"/api/conversations/group" , {
        method : "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
         
        },
        body:JSON.stringify(group),
      });
      await response.json();
     //console.log(data)
      
    
    } catch (err) {
      console.log(err);
    }
    
    console.log("Group Created")
  }
 // const [convoId, setConvoId] = useState(null);

  // const handleConvoIdUpdate = (id) => {
  //   setConvoId(id);
  //   setCurrentChat(convoId);  // Set currentChat directly with the new id
  //   console.log('Conversation ID in Parent:', id);
  // };
  
  

return (
  <>
    <Navbar />
    <div className="messenger" style={{ display: 'flex', gap: '1rem', padding: '2rem', height: 'calc(100vh - 64px)' }}>
      
      {/* Conversations List */}
      <WidgetWrapper
        className="chatMenu"
        sx={{
          flexBasis: isNonMobileScreens ? '30%' : '10%',
          height: 'auto',
          padding: '0 0 0 0',
          backgroundColor: palette.background.default,
          borderRadius: '1rem',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="chatMenuWrapper" style={{ overflowY: 'auto', height: '100%' }}>
          <input
            placeholder="Search for friends"
            className="chatMenuInput"
            onClick={handleSearch}
            onChange={(e) => {
                  setKey(e.target.value) ;
                  setIsSearched(true)}}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '1.5rem',
              border: `1px solid ${palette.divider}`,
              color: mode === 'dark' ? '#FAFAFA' : '#000000',
              backgroundColor: palette.neutral.light,
              boxShadow: mode === 'dark'
                ? '0 2px 4px rgba(250, 250, 250, 0.1)'
                : '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'border-color 0.3s, background-color 0.3s',
              outline: 'none',
            }}
          />
            <button
              className="chatSubmitButton"
              onClick={handleGroupCreate}
              style={{
                maxWidth: isNonMobileScreens ? '100%' : '30px',
                height: '3rem',
                width: '100%',
                padding: '1rem 1.75rem',
                backgroundColor: '#4dc247',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: '600',
                borderRadius: '1.5rem',
                color: '#fff',
                cursor: 'pointer',
                opacity: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3da838'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4dc247'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isNonMobileScreens ? "+ New Group" : "+"}
            </button>
            

          {
            
            conversations.length > 0 ? (
            conversations.map((c) => (
              <div
                key={c._id}
                className="chatMenuItem"
                style={{
                  padding: '0 0 0 0',
                  marginBottom: '0.5rem',
                  borderRadius: '0.75rem',
                  backgroundColor: palette.neutral.light,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  outline: currentChat?._id === c._id ? '4px solid rgba(70, 130, 180, 0.6)' : 'none',
                  border: 'none', // Make sure the border is not set
                }}
                onClick={() => {
                  setCurrentChat(currentChat !== c ? c : null);
                  setIsGroupCreated(false);
                  setKey('');
                }}

              >
              {<Conversation 
                isOnline={
                  c.members.every(memberId =>
                    onlineUserslocal.some(user => user.userId === memberId)
                  )
                }
                conversation={c} 
                currentUser={user} 
              />}
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: palette.text.secondary }}>
              No conversations available
            </p>
          )}
        </div>
      </WidgetWrapper>

      {/* Chat Box */}
      <WidgetWrapper
        className="chatBox"
        sx={{
          flexBasis: '60%',
          height: '100%',
          position: 'relative',
          padding: '0 1rem 0 1rem',
          backgroundColor: palette.background.default,
          borderRadius: '1rem',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
{isGroupCreated && (
  <WidgetWrapper
    sx={{
      zIndex: 1,
      flexBasis: '60%',
      height: '100%',
      position: 'relative',
      padding: '1rem',
      backgroundColor: palette.background.default,
      borderRadius: '1rem',
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
    }}
  >
    <CreateGroupForm friends={friends} onCreateGroup={handleGroupCreate} userId={_id}sx={{ height: '80%' }} />
  </WidgetWrapper>
)}


        {currentChat ? (
          <WidgetWrapper
                sx={{
                  zIndex: 1,
                  flexBasis: '60%',
                  height: '100%',
                  position: 'relative',
                  padding: '1rem',
                  backgroundColor: palette.neutral.light,
                  borderRadius: '1rem',
                  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                }}
          >
            <div
              className="chatBoxTop"
              style={{
                overflowY: 'auto',
                height: 'calc(100% - 5rem)',
                padding: '0.5rem',
              }}
            >
              {messages.map((m, index) => (
                <div 
                // ref={index === messages.length - 1 ? scrollRef : scrollRefee} 
                key={index}>
                  <Message message={m} own={m.sender === _id} sender={m.sender} arrivalMessage={arrivalMessage}/>
                </div>
              ))}
              <div ref={scrollRef}></div>
            </div>

            <div
              className="chatBoxBottom"
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'black',
                borderRadius: '1rem',
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <InputBase
                placeholder="Write something ..."
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
                inputRef={inputRef}
                sx={{
                  flex: 1,
                  height: '3rem',
                  backgroundColor: palette.neutral.light,
                  borderRadius: '2rem',
                  padding: '1rem',
                  boxShadow: mode === 'dark'
                    ? '0 4px 8px rgba(250, 250, 250, 0.1)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'border-color 0.3s, background-color 0.3s',
                  '&:focus-within': {
                    borderColor: palette.primary.main,
                  },
                  '::placeholder': {
                    color: palette.text.secondary,
                    opacity: 0.8,
                  },
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    handleSubmit();
                  }
                }}
              />

              <button
                disabled={!newMessage.trim()}
                className="chatSubmitButton"
                onClick={handleSubmit}
                style={{
                  height: '3rem',
                  padding: '0 1.5rem',
                  backgroundColor: '#4dc247',
                  border: 'none',
                  borderRadius: '1.5rem',
                  color: '#fff',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  opacity: newMessage.trim() ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SendIcon style={{ marginRight: '0.5rem' }} />
              </button>
            </div>
          </WidgetWrapper>
        ) : (
          <span className="noConversationText" style={{ display: 'block', padding: '1rem' }}>
            Open a conversation to start a chat.
          </span>
        )}
      </WidgetWrapper>

      {/* Optional Friend List */}
      {isNonMobileScreens && (
        <Box flexBasis="36%" m="0 0 0 0" p = '0 0 0 0' >
          <FriendListWidget userId={_id} admin={true} />
        </Box>
      )}
    </div>
  </>
);

}

export default Messenger;