import { useState } from 'react';
import "./style.css"
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Help,
  Menu,
  Close,
} from "@mui/icons-material";
import UserImage from '../../components/UserImage';
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "../../state"
import { useNavigate } from "react-router-dom";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from '../../components/WidgetWrapper';
import {  useEffect } from 'react';

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const [isClicked, setIsClicked] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [Users, setUsers]   = useState([]);
  const theme = useTheme();
  const {palette} = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName =  `${user.firstName} ${user.lastName}`;
  const token = useSelector((state) => state.token );

  const [isUnreadMessages, setIsUnreadMessages] = useState(false);
  const [isUnseenNotifications, setIsUnseenNotifications] = useState(false);
  

  const handleGetUsers = async ()=>{
    const response = await fetch(process.env.REACT_APP_SERVER+`/users/reveal_all_users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setUsers(data)
  }

  const hasUnreadMessages = async ()=>{
    //console.log('hasUnreadMessages says Hi')
    const response = await fetch(process.env.REACT_APP_SERVER+`/api/messages/isUnreadMessages/${user._id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    //console.log('hasUnreadMessages says Hi',data)
    setIsUnreadMessages(data.hasUnreadMessages)
  }
  useEffect(()=>{
    hasUnreadMessages();
  },[])

  const handleSearch = (e)=>{
    setIsSearched(true)
    const searchKey = e?.target?.value?.toLowerCase()
    if(!searchKey) setIsSearched(false)
    const searchResult = Users.filter((user) => {
      
      return (
        user.firstName.toLowerCase().includes(searchKey) ||
        user.lastName.toLowerCase().includes(searchKey) ||
        user.email.toLowerCase().includes(searchKey)
      );
    });
    
    setFilteredUsers(searchResult); 
    console.log(filteredUsers)

  }

  const showList=(e, zone)=>{
    e?.stopPropagation()
    console.log(zone);
    
    if(zone === "nav") setIsSearched(false)
    else if(zone === "search") setIsSearched(true)
  }
  const fetchNotifications = async () => {
    try {
        const response = await fetch(
             process.env.REACT_APP_SERVER+`/users/${user._id}/notifications`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        data.length > 0 && setIsUnseenNotifications(true)
    } catch (error) {
        console.error('Error updating friend:', error);
    }

};
useEffect(()=>{
fetchNotifications();
},[])

  return (
    <div onClick={(e) => showList(e,"nav")}>
      <FlexBetween padding="1rem" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
{/* Add Profile Photo */}
      <UserImage image={user.picturePath} onClick={() => setIsClicked(!isClicked)} id={user._id} />
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          FacePedia
        </Typography>
        <div className='search-bar-container'>
        {isNonMobileScreens && (
          <div onClick={handleGetUsers}>
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="9px"
            gap="3rem"
            padding="0.1rem 1.5rem"
          >
            <InputBase 
              placeholder="Search..." 
              onChange={(e) => handleSearch(e)} 
            />
            <IconButton onClick={(e) => { showList(e,"search")}}>
              <Search />
            </IconButton>
          </FlexBetween>
          </div>
        ) }{
        isSearched && (
          <WidgetWrapper 
          className='search-list-container'
>
          
            {filteredUsers.map((u) => u._id !== user._id && (
              <div
                key={u._id}
                style={{
                  padding: '10px 20px',
                  backgroundColor: neutralLight,
                  margin: '5px 0',
                  borderRadius: '5px',
                  display: 'flex',             // Added flex to align items horizontally
                  alignItems: 'center',       // Vertically center the items
                  justifyContent: 'left', // Ensure there's space between the name and image
                }}
                sx={{
                  '&:hover': { cursor: 'pointer' }
                }}
                
                onClick={() => navigate(`/profile/${u._id}`)}
              >
                <UserImage image={u.picturePath} size="30px" />
                <div style={{margin:'5px'}}></div>
                <Typography 
                  sx={{ 
                    marginRight: '10px' ,
                    '&:hover':{cursor:'pointer'
                    }}}>
                    {u.firstName + ' ' + u.lastName}
                  </Typography>
                
              </div>

             
            ))}
          
          </WidgetWrapper>  
          )

        }
        </div>




      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>

          <IconButton onClick={()=>navigate(`/messenger`)}>
            <Message sx={{ fontSize: "25px" }}  />
            {isUnreadMessages && (
              <Box
                position="absolute"
                top="0"
                right="0"
                width="10px" // Size of the dot
                height="10px" // Size of the dot
                bgcolor="#1ABC9C" // Dot color
                borderRadius="50%" // Make it circular
                //border="2px solid white" // Optional: adds a border to the dot for better visibility
                zIndex="1" // Ensure the dot is above the image
              />
            )}
          </IconButton>

          <IconButton onClick={()=>navigate(`/notifications`)}>
            <Notifications sx={{ fontSize: "25px" }}  />
            {isUnseenNotifications && (
              <Box
                position="absolute"
                top="0"
                right="0"
                width="10px" // Size of the dot
                height="10px" // Size of the dot
                bgcolor="#1ABC9C" // Dot color
                borderRadius="50%" // Make it circular
                //border="2px solid white" // Optional: adds a border to the dot for better visibility
                zIndex="1" // Ensure the dot is above the image
              />
            )}
          </IconButton>

          <IconButton onClick={()=>navigate(`/help`)}>
            <Help sx={{ fontSize: "25px" }} />
          </IconButton>

          

          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName.length <10 ? fullName : user.firstName}</Typography>
              </MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <IconButton onClick={()=>navigate(`/messenger`)}>
            <Message sx={{ fontSize: "25px" }}  />
            {isUnreadMessages && (
              <Box
                position="absolute"
                top="0"
                right="0"
                width="10px" // Size of the dot
                height="10px" // Size of the dot
                bgcolor="#1ABC9C" // Dot color
                borderRadius="50%" // Make it circular
                //border="2px solid white" // Optional: adds a border to the dot for better visibility
                zIndex="1" // Ensure the dot is above the image
              />
            )}
          </IconButton>
          <IconButton onClick={()=>navigate(`/notifications`)}>
            <Notifications sx={{ fontSize: "25px" }}  />
            {isUnseenNotifications && (
              <Box
                position="absolute"
                top="0"
                right="0"
                width="10px" // Size of the dot
                height="10px" // Size of the dot
                bgcolor="#1ABC9C" // Dot color
                borderRadius="50%" // Make it circular
                //border="2px solid white" // Optional: adds a border to the dot for better visibility
                zIndex="1" // Ensure the dot is above the image
              />
            )}
          </IconButton>
          <IconButton  onClick={()=>navigate(`/help`)}>
          <Help sx={{ fontSize: "25px" }} />
          </IconButton>
            
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  Log Out
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
    </div>
  );

};

export default Navbar;
