import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserImage = ({ id, image = "noAvatar.jpg", size = '57px', isOnline = false, isGroup }) => {
  const navigate = useNavigate();
  const PF = process.env.REACT_APP_SERVER+"/assets/" ;
  
  return (
<Box
  position="relative"
  width={size}
  height={size}
  onClick={() => {
    if (!isGroup) {
      undefined !== id &&
      navigate(`/profile/${id}`);
    }
    window.location.reload();
  }}
>

      <img
        style={{ objectFit: 'cover', borderRadius: '50%' }}
        width={size}
        height={size}
        alt="user"
        src={ PF +  image}
      />
      {isOnline && (
        <Box
          position="absolute"
          top="0"
          right="0"
          width="12px" // Size of the dot
          height="12px" // Size of the dot
          bgcolor="green" // Dot color
          borderRadius="50%" // Make it circular
          border="2px solid white" // Optional: adds a border to the dot for better visibility
          zIndex="1" // Ensure the dot is above the image
        />
      )}
    </Box>
  );
};

export default UserImage;
