import { useEffect } from "react";
import Friend from '../../components/Friend';
import WidgetWrapper from '../../components/WidgetWrapper';
import { Box, Typography, useTheme } from '@mui/material';
import { setFriends } from "../../state";
import { useDispatch, useSelector } from 'react-redux';

const FriendListWidget = ({ userId, admin }) => {
    const dispatch = useDispatch();
    const { palette } = useTheme();
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);

    const getFriends = async () => {
        try {
            const response = await fetch(
                process.env.REACT_APP_SERVER+`/users/${userId}/friends`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch friends');
            const data = await response.json();
            dispatch(setFriends({ friends: data }));
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    useEffect(() => {
        getFriends();
    }, [userId, token]);

    return (
        <WidgetWrapper>
            <Typography
                color={palette.neutral.dark}
                variant="h5"
                fontWeight="500"
                sx={{ mb: '1.5rem' }}
            >
                People {admin ? 'you' : 'they'} follow:
            </Typography>
            <Box display="flex" flexDirection="column" gap="1.5rem">
                {friends?.length ? (
                    friends.map((friend) => (
                        <Friend
                            key={friend._id}
                            friendId={friend._id}
                            name={`${friend.firstName} ${friend.lastName}`}
                            subtitle={friend.occupation}
                            userPicturePath={friend.picturePath}
                            visitor={!admin}
                        />
                    ))
                ) : (
                    <Typography>No friends to display.</Typography>
                )}
            </Box>
        </WidgetWrapper>
    );
};

export default FriendListWidget;
