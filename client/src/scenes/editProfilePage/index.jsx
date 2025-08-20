//EditProfilePage
import UserImage from "../../components/UserImage";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Navbar from "../navbar";
import { toast } from "react-toastify"; // Optional for notifications
import "react-toastify/dist/ReactToastify.css"; // Import styles
import { setLogin } from "../../state";

import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";

const EditProfilePage = () => {
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { palette } = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [isChangePasswordClicked, setIsChangePasswordClicked] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const  navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageForPreview, setImageForPreview] = useState(null);
  const dispatch = useDispatch();

  const getUser = async () => {
    const response = await fetch(process.env.REACT_APP_SERVER+`/users/${userId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setUser(data);
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!user) return null;
 //console.log(user);

 const registerSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
  location: yup.string().required("required"),
  occupation: yup.string().required("required"),
  picture: yup.string(),
  newPassword : yup.string(),
});
  const  {
    firstName,
    lastName,
    email,
    password,
    location,
    occupation,
    picturePath, 
  } = user ;
//console.log('values : ',values)

const handleFormSubmit = async (values, { resetForm }) => {
  if (newPassword !== values.password && isChangePasswordClicked) {
    alert("Passwords do not match. Try Again");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("email", values.email);
    formData.append("location", values.location);
    formData.append("occupation", values.occupation);
    formData.append("password", values.password);

    if (isChangePasswordClicked) {
      formData.append("newPassword", newPassword);
    }

    if (image) {
      formData.append("picture", image);
      formData.append("picturePath", image.name);
    }

    const response = await fetch(process.env.REACT_APP_SERVER+`/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
      resetForm();
      dispatch(
              setLogin({
                user: user,
                token: token,
              })
            );
      navigate("/home");
    } else {
      const errorData = await response.json();
      toast.error(`Error: ${errorData.message}`);
    }
  } catch (err) {
    console.error("Error:", err);
    toast.error("Failed to update profile. Please try again later.");
  }
};

  
  const toggleChangePassword =()=>{
    setIsChangePasswordClicked(!isChangePasswordClicked);
  }

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >
        <WidgetWrapper flexBasis="74%" >
        <Formik
  onSubmit={handleFormSubmit}
  initialValues={{
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    location: user.location || "",
    occupation: user.occupation || "",
    password: user.password || "",
    newPassword : '',
    picturePath: user.picturePath || "",
  }}
  validationSchema={registerSchema}
  enableReinitialize // This ensures the form updates 
>
  {({
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    values,
    setFieldValue,
    resetForm,
  }) => (
    <form onSubmit={handleSubmit}>
      <Box
        display="grid"
        gap="30px"
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
      >
        <Box sx={{ gridColumn: "span 2" }}>
          <TextField
            id="firstName"
            label="First Name"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.firstName}
            name="firstName"
            error={Boolean(touched.firstName) && Boolean(errors.firstName)}
            helperText={touched.firstName && errors.firstName}
            fullWidth
          />
          <TextField
            id="lastName"
            label="Last Name"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.lastName}
            name="lastName"
            error={Boolean(touched.lastName) && Boolean(errors.lastName)}
            helperText={touched.lastName && errors.lastName}
            fullWidth
            sx={{ mt: 3 }}
          />
          <TextField
            id="location"
            label="Location"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.location}
            name="location"
            error={Boolean(touched.location) && Boolean(errors.location)}
            helperText={touched.location && errors.location}
            fullWidth
            sx={{ mt: 3 }}
          />
          <TextField
            id="occupation"
            label="Occupation"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.occupation}
            name="occupation"
            error={Boolean(touched.occupation) && Boolean(errors.occupation)}
            helperText={touched.occupation && errors.occupation}
            fullWidth
            sx={{ mt: 3 }}
          />
          <TextField
            id="email"
            label="Email"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.email}
            name="email"
            error={Boolean(touched.email) && Boolean(errors.email)}
            helperText={touched.email && errors.email}
            fullWidth
            sx={{ mt: 3 }}
          />
          <TextField
            id="password"
            label= {isChangePasswordClicked ? "Change Password" : "Current Password"}
            type="password"
            onBlur={handleBlur}
            onChange={handleChange }
            onClick={toggleChangePassword}
            value={values.password}
            name="password"
            error={Boolean(touched.password) && Boolean(errors.password)}
            helperText={touched.password && errors.password}
            fullWidth
            sx={{ mt: 3 }}
          />
{
  isChangePasswordClicked && 
  <TextField
            id="password"
            label="New Password Again"
            type="password"
            onBlur={handleBlur}
            onChange={(e)=>{setNewPassword(e.target.value)}}
            value={newPassword}
            name="password"
            error={Boolean(touched.password) && Boolean(errors.password)}
            helperText={touched.password && errors.password}
            fullWidth
            sx={{ mt: 3 }}
          />

}
        </Box>

        <Box
          sx={{
            gridColumn: "span 2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
        {(imageForPreview  || console.log(imageForPreview)) ? (
        <img
        style={{ objectFit: 'cover', borderRadius: '50%' }}
        width="300px"
        height="300px"
        alt="user"
        src={ imageForPreview }
      />)
:
        <img
        style={{ objectFit: 'cover', borderRadius: '50%' }}
        width="300px"
        height="300px"
        alt="user"
        src={ process.env.REACT_APP_SERVER+"/assets/" + values.picturePath }
      />
}
          
          <Box
            sx={{
              border: `1px solid ${palette.neutral.medium}`,
              borderRadius: "5px",
              p: "1rem",
              mt: 3,
              width: "100%",
            }}
          >
            <Dropzone
  acceptedFiles=".jpg,.jpeg,.png"
  multiple={false}
  onDrop={(acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      const objectUrl = URL.createObjectURL(file);
      setImageForPreview(objectUrl);
      
    }
  }}
>
  {({ getRootProps, getInputProps }) => (
    <Box
      {...getRootProps()}
      sx={{
        border: `2px dashed ${palette.primary.main}`,
        p: "1rem",
        "&:hover": { cursor: "pointer" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <input {...getInputProps()} />
      {!image ? (
        <Typography>Add Profile Picture</Typography>
      ) : (
        <FlexBetween>
          <Typography>{image.name}</Typography>
          <EditOutlinedIcon />
        </FlexBetween>
      )}
    </Box>
  )}
</Dropzone>


          </Box>
        </Box>
      </Box>
      <Box sx={{ gridColumn: "span 4" }}>
        <Button
          fullWidth
          type="submit"
          sx={{
            m: "2rem 0",
            p: "1rem",
            backgroundColor: palette.primary.main,
            color: palette.background.alt,
            "&:hover": { color: palette.primary.main },
          }}
        >
          SAVE
        </Button>
        <Typography
          onClick={() => resetForm()}
          sx={{
            textDecoration: "underline",
            color: palette.primary.main,
            "&:hover": { cursor: "pointer", color: palette.primary.light },
          }}
        >
          RESET
        </Typography>
      </Box>
    </form>
  )}
</Formik>

        </WidgetWrapper>

        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          {/* <FriendListWidget userId={userId} /> */}
        </Box>

      </Box>
    </Box>
  );
};

export default EditProfilePage;