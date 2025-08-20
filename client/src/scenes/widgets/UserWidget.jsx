import {
    PersonAddOutlined, 
    PersonRemoveOutlined,
    EditOutlined,
    LocationOnOutlined,
    WorkOutlineOutlined,
    ManageAccountsOutlined,
}from '@mui/icons-material';
import {Typography, Box , Divider, useTheme, IconButton} from '@mui/material';
import UserImage from '../../components/UserImage';
import FlexBetween from '../../components/FlexBetween'
import WidgetWrapper from '../../components/WidgetWrapper'
import { useSelector, useDispatch } from 'react-redux';
import { setFriends } from '../../state';

import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';

const UserWidget = ({userId, picturePath})=> {
    //console.log(picturePath);
    const [user, setUser] = useState(null);
    const {palette} = useTheme();
    const navigate = useNavigate();
    const token = useSelector((state) => state.token );
    const personId = useSelector((state) => state.user._id ) ;
    const loggedInUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const self = personId === userId
    const [isEditProfile, setIsEditProfile] = useState(false);
    
    const dark = palette.neutral.dark;
    const medium = palette.neutral.medium;
    const main = palette.neutral.main;
    const primaryLight = palette.primary.light;
    const primaryDark = palette.primary.dark;
    const isFriend = loggedInUser.friends?.find((friend) => friend._id === personId);
    const getUser = async()=>{
        const response = await fetch(process.env.REACT_APP_SERVER+`/users/${userId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data);
    };
    useEffect(()=>{
        getUser();
    },[])
    if(!user){
        return null;
    }
    const {
        firstName,
        lastName,
        location,
        occupation,
        viewedProfile,
        impressions,
        friends,
    } = user ;
        const patchFriend = async () => {
            if (self) {
                alert("Can't add yourself as a friend. SORRY!!!");
            } else {
                try {
                    const response = await fetch(
                        process.env.REACT_APP_SERVER+`/users/${loggedInUser._id}/${userId}`,
                        {
                            method: "PATCH",
                            credentials: 'include',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    dispatch(setFriends({ friends: data }));
                    const newNotification = {
                        type : 'follow',
                        message : `${loggedInUser.firstName} ${loggedInUser.lastName}started following you`,
                        postId : `${userId}`,
                    }
                    const res = await fetch(
                        process.env.REACT_APP_SERVER+`/users/${userId}/notifications`,
                        {
                            method: "POST",
                            credentials: 'include',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body : JSON.stringify(newNotification),
                        }
                    )
                    if (!res.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Error updating friend:', error);
                }
            }
        };

    return (
        <WidgetWrapper>
            {/* FIRST ROW */}
            <FlexBetween 
                gap='0.5rem'
                pb='1.1rem'
                

                // onClick={()=>navigate('/profile/${userId')}
            
            >
                <FlexBetween gap="1rem">
                    <UserImage image = {picturePath} id={userId} />
                    <Box >
                        <Typography
                            onClick={() => navigate(`/profile/${userId}`)} 
                            variant='h4'
                            color={dark}
                            fontWeight={500}
                            sx={{
                                '&:hover':{color:palette.primary.light, cursor:'pointer'}
                            }}
                        > 
                            { firstName + ' ' + lastName}
                        </Typography>
                        <Typography color={medium} > {friends?.length} friends </Typography>
                    </Box>
                  
                </FlexBetween>

                {self ? (
                    <IconButton
                    onClick={()=> {
                        setIsEditProfile(!isEditProfile);
                        navigate(`/editProfile/${userId}`)
                    } }>
                < ManageAccountsOutlined />
                
                </IconButton>
                ) : (
                       
                        <IconButton
                          onClick={patchFriend}
                          sx={{ backgroundColor: primaryLight, p: '0.6rem' }}
                        >
                          {isFriend ? (
                            <PersonRemoveOutlined sx={{ color: primaryDark }} />
                          ) : (
                            <PersonAddOutlined sx={{ color: primaryDark }} />
                          )}
                        </IconButton>
                )
                
                }
                

                </FlexBetween>
                <Divider />
                {/* SECOND ROW */}
                <Box p='1rem 0'>
                    <Box display='flex' alignItems='center' gap='1rem' mb='0.5rem'>
                        <LocationOnOutlined fontSize='large' sx={{color:main}}/>
                        <Typography color={medium}>{location}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap="1rem">
                        <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
                        <Typography color={medium}>{occupation}</Typography>
                    </Box>
                </Box>
                <Divider />
                {/* THIRD ROW */}
                <Box p="1rem 0">
                    <FlexBetween mb="0.5rem">
                        <Typography color={medium}>Who's viewed your profile</Typography>
                        <Typography color={main} fontWeight="500">
                            {viewedProfile}
                        </Typography>
                    </FlexBetween>
                    <FlexBetween>
                        <Typography color={medium}>Impressions of your post</Typography>
                        <Typography color={main} fontWeight="500">
                            {impressions}
                        </Typography>
                    </FlexBetween>
                </Box>
                <Divider />
                {/* FOURTH ROW */}
                <Box p='1rem 0'>
                    <Typography fontSize='1rem' color={main} fontWeight={500} mb='1rem'>Social Profiles</Typography>
                    
                    {/* TWITTER */}
                    <FlexBetween gap = '1rem' mb='0.5rem'>
                        <FlexBetween gap='1rem'>
                            <img src='../assets/twitter.png' alt='twitter'/>
                            <Box >
                                <Typography color={main} fontWeight='500'>
                                    Twitter
                                </Typography>
                                <Typography color={medium}>Social Network</Typography>
                            </Box>
                        </FlexBetween>
                        <EditOutlined sx={{color:main}}/>
                    </FlexBetween>
                    {/* LINKED IN */}
                    <FlexBetween gap = '1rem' >
                        <FlexBetween gap='1rem'>
                            <img src='../assets/linkedin.png' alt='linkedin'/>
                            <Box >
                                <Typography color={main} fontWeight='500'>
                                Linked In
                                </Typography>
                                <Typography color={medium}>Network Platform</Typography>
                            </Box>
                        </FlexBetween>
                        <EditOutlined sx={{color:main}}/>
                    </FlexBetween>


                </Box>
            

            
        </WidgetWrapper>
    )
};

export default UserWidget;