import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";
import WidgetWrapper from '../WidgetWrapper';
import "./conversation.css";
import UserImage from '../UserImage';

export default function SearchedConversation({ conversation, currentUser, isOnline, onConvoIdUpdate }) {
    const token = useSelector((state) => state.token);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastMessage, setLastMessage] = useState(null);
  
    const getConversationId = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+`/api/conversations/find/${currentUser._id}/${conversation._id}`, {
          method: "GET",
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data && data._id) {
          onConvoIdUpdate(data._id); // Pass convoId to the parent
          return data._id;
        }
      } catch (err) {
        console.log(err);
      }
      return null;
    };
  
    useEffect(() => {
      const fetchUnreadCount = async (convoId) => {
        try {
          const unreadResponse = await fetch(process.env.REACT_APP_SERVER+`/api/messages/unread/${convoId}/${currentUser}`, {
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
  
      const fetchLastMessage = async (convoId) => {
        try {
          const response = await fetch(process.env.REACT_APP_SERVER+`/api/messages/${convoId}`, {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const messages = await response.json();
          setLastMessage(messages[messages.length - 1]?.text || '');
        } catch (err) {
          console.log(err);
        }
      };
  
      const initialize = async () => {
        const convoId = await getConversationId();
        if (convoId) {
          await fetchUnreadCount(convoId);
          await fetchLastMessage(convoId);
        }
      };
  
      initialize();
    }, [conversation, currentUser, token, onConvoIdUpdate]);
  
    return (
      <WidgetWrapper className="conversation">
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <UserImage image={conversation?.picturePath} isOnline={isOnline} id={conversation?._id} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span className="conversationName">
              {conversation?.firstName}
            </span>
            {
              lastMessage ? 
              <span className="conversationLastMessage">
                {lastMessage.length > 17 ? `${lastMessage.slice(0, 17)}...` : lastMessage}
              </span>
              : 
              <span className="conversationLastMessage">
                - No Messages -
              </span>                  
            }
          </div>
        </div>
        {unreadCount > 0 && lastMessage?.sender !== currentUser && 
        <div className="unreadCount">{unreadCount}</div>}
      </WidgetWrapper>
    );
  }
  