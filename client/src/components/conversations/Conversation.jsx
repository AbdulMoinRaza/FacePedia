import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import WidgetWrapper from '../WidgetWrapper';
import "./conversation.css";
import { useTheme } from '@emotion/react';
import UserImage from '../UserImage';

export default function Conversation({ conversation, currentUser, isOnline }) {
  const token = useSelector((state) => state.token);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState(null);
  const { palette } = useTheme();
  const isGroup = conversation.members.length > 2 ? true : false;
  const groupDP = conversation.more?.photo?.path ? conversation.more.photo.path :  'noAvatar.jpg';
  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser._id);

    const fetchUserData = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+`/users/${friendId}`, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const unreadResponse = await fetch(process.env.REACT_APP_SERVER+`/api/messages/unread/${conversation._id}/${currentUser._id}`, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const unreadMessages = await unreadResponse.json();
        setUnreadCount(unreadMessages.length);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchLastMessage = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+`/api/messages/${conversation._id}`, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const messages = await response.json();
        //console.log('messages : ',messages)
        setLastMessage(messages[messages.length - 1]?.text || '');
      } catch (err) {
        console.log(err);
      }
     // console.log(lastMessage)
    };

    fetchUserData();
    fetchUnreadCount();
    fetchLastMessage();
  }, [conversation, currentUser._id, token]);

  return (
    <WidgetWrapper className="conversation">
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <UserImage image={isGroup ? groupDP : user?.picturePath} isOnline={!isGroup && isOnline} id={user?._id} isGroup/>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span className="conversationName">
            {!isGroup ? user?.firstName : conversation.more?.name}
          </span>
          {(!isGroup ) ? (
            lastMessage ? 
            <span className="conversationLastMessage">
              {lastMessage.length > 17 ? `${lastMessage.slice(0, 17)}...` : lastMessage}
            </span>
            : 
            <span className="conversationLastMessage">
              - No Messages -
            </span>
          

          ) : (
            <span className="conversationLastMessage">
              {conversation.members.length} Members
            </span>
          )
          
          }
        </div>
      </div>
      {unreadCount > 0 && lastMessage?.sender !== currentUser && 
      <div className="unreadCount">{unreadCount}</div>}
    </WidgetWrapper>
  );
}
