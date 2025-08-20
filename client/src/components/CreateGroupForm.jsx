import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
  GroupAdd,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  Typography,
  useTheme,
  Button,
  IconButton,
} from '@mui/material';
import FlexBetween from './FlexBetween';
import Dropzone from 'react-dropzone';
import React, { useState } from 'react';
import UserImage from './UserImage';

const CreateGroupForm = ({ friends, onCreateGroup, userId }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [details, setDetails] = useState(''); // For notes/details
  const { palette } = useTheme();
  const [isAddClicked, setIsAddClicked] = useState(false);
  const [groupDes, setGroupDes] = useState("");

  const handleFriendSelect = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('Group name cannot be empty');
      return;
    }

    // Include userId in the selectedFriends array
    const updatedMembers = [...selectedFriends, userId];

    if (updatedMembers.length < 2) { // Check if the updated array has at least two members
      alert('A group must have at least two members, including yourself');
      return;
    }

    console.log(updatedMembers); // Log the updated members
    const moreInfo = {
      name: groupName,
      photo: image, // Assuming you want to use the image
      notes: details,
    };
    onCreateGroup({ more: moreInfo, members: updatedMembers });
    setGroupName('');
    setSelectedFriends([]);
    setImage(null); // Reset image state
    setDetails(''); // Reset details state
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '1rem',
        }}
      />
      <input
        type="text"
        placeholder="Group Description"
        value={groupDes}
        onChange={(e) => setGroupDes(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '1rem',
        }}
      />
      
      {/* Image Upload */}
      {isImage && (
        <Box
          borderRadius='5px'
          border={`1px solid ${palette.medium}`}
          mt='1rem'
          p='1rem'
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width='100%'
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Drop Files Here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton 
                    onClick={() => setImage(null)}
                    sx={{ width: "15%" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}
      
      <Divider sx={{ margin: '1.25rem 0' }} />
      <FlexBetween>
        <FlexBetween gap='0.25rem' onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: palette.medium }} />
          <Typography 
            color={palette.medium}
            sx={{ '&:hover': { cursor: 'pointer', color: palette.primary.main } }}
          >
            Add Group Photo
          </Typography>
        </FlexBetween>

        <FlexBetween gap='0.3rem' onClick = {()=> setIsAddClicked(!isAddClicked)} >
        <GroupAdd/>
          <Typography 
              color={palette.medium}
              sx={{ '&:hover': { cursor: 'pointer', color: palette.primary.main } }}
            >
              Add Friends
            </Typography>
        </FlexBetween>

      </FlexBetween>

      {isAddClicked && <div
        style={{
          maxHeight: '500px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '0.5rem',
          borderRadius: '5px',
        }}
      >
        <h4>Select Friends</h4>
        {friends.map((friend) => (
          <div
            key={friend._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem',
              height: '50px',
              cursor: 'pointer',
            }}
            onClick={() => handleFriendSelect(friend._id)}
          >
            <input
              type="checkbox"
              checked={selectedFriends.includes(friend._id)}
              onChange={() => handleFriendSelect(friend._id)}
              style={{
                margin: '1rem',
                width: '20px', // Larger checkbox
                height: '20px', // Larger checkbox
                cursor: 'pointer',
                accentColor: selectedFriends.includes(friend._id) ? '#4A90E2' : 'initial', // Change color when checked
              }}
            />
            <UserImage image={friend.picturePath} size="30px" style={{ margin: '1rem' }} />
            <span style={{ marginLeft: '0.5rem' }}>
              {friend.firstName} {friend.lastName}
            </span>
          </div>
        ))}
      </div>}

      <Button
        type="submit"
        style={{
          backgroundColor: '#4dc247',
          border: 'none',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
        }}
      >
        Create Group
      </Button>
    </form>
  );
};

export default CreateGroupForm;
