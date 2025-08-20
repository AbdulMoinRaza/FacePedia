import axios from "axios";
import { useEffect, useState } from "react";
import "./chatOnline.css";
import { useSelector } from 'react-redux';

export default function ChatOnline({ onlineUsers, currentId, setCurrentChat }) {
  const token = useSelector((state) => state.token);
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const PF = process.env.REACT_APP_SERVER+"/assets/";
  const loggedInUser = useSelector((state) => state.user);

  //console.log(loggedInUser.friends)
  useEffect(() => {
    const getFriends = async () => {
      setFriends(loggedInUser.friends)
      // const res = await fetch("/users/" + currentId, {
      //   headers: {
      //     method : "GET",
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      // console.log(res.data)
      
      //setFriends(res.data.friends);
    };

    getFriends();
  }, [currentId]);

  useEffect(() => {
    setOnlineFriends(friends?.filter((f) => onlineUsers.includes(f._id)));
  }, [friends, onlineUsers]);

  const handleClick = async (user) => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER+`/api/conversations/find/${currentId}/${user._id}`, {
        method : "GET",
        credentials: 'include',
        headers: {
          
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setCurrentChat(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chatOnline">
      {onlineFriends?.map((o) => (
        <div className="chatOnlineFriend" onClick={() => handleClick(o)}>
          <div className="chatOnlineImgContainer">
            <img
              className="chatOnlineImg"
              src={
                o?.profilePicture
                  ? PF + o.profilePicture
                  : PF + "noAvatar.jpg"
              }
              alt=""
            />
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">{o?.username}</span>
        </div>
      ))}
    </div>
  );
}