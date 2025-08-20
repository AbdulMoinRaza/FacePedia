import "./message.css";
import UserImage from "../UserImage";
import { useSelector } from 'react-redux';
import useTimeAgo from "../../hooks/useTimeAgo";
import { useEffect, useState } from "react";

export default function Message({ message, own, sender, arrivalMessage, isGroup }) {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [readers, setReaders] = useState([]);
  const [pic, setPic] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER+`/users/${sender}`, {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPic(own ? user.picturePath : data.picturePath);
          setId(own ? user._id : data._id);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getUser();
  }, [sender, token, own, user.picturePath]);

  useEffect(() => {
      setReaders(message.readBy?.filter((person) => person === message.sender));
  }, [arrivalMessage,message]);

  const readReceiptUrl = `${process.env.REACT_APP_SERVER}/assets/readReceipts.png`;
  
  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        {isGroup && <UserImage image={pic} size="30px" id={id} />}
        <p className="messageText">
          {message.text }
          {own && (
            message.readBy?.length > 1 && readers.length > 0  ? (
              <span className="blue-tick" style={{ '--mask-url': `url(${readReceiptUrl})` }} />
            ) : (
              <span className="sent" />
            )
          )}
        </p>
      </div>
      <div className="messageBottom">
        <span>{ useTimeAgo(message.createdAt)}</span>
      </div>
    </div>
  )
}