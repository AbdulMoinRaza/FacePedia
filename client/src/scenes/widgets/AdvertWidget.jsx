import {Typography, useTheme} from '@mui/material';
import FlexBetween from '../../components/FlexBetween';
import WidgetWrapper from '../../components/WidgetWrapper';

const AdvertWidget = ()=>{
    const {palette} = useTheme();
    const dark = palette.neutral.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    return (
        <WidgetWrapper>
            <FlexBetween >
                <Typography color={dark} variant='h5' fontWeight='500' >
                    Sponsored
                </Typography>
                <Typography color={medium} >Create Add</Typography>
            </FlexBetween>
            <img 
                width='100%'
                height='auto'
                alt='ad'
                src={process.env.REACT_APP_SERVER+'/assets/ad.jpeg'}
                style={{borderRadius : '0.75', margin:'0.75rem 0'}}
            />
            <FlexBetween>
                <Typography color= { main }  >Some Cosmetics </Typography>
                <Typography colro= { main } >somecosmetics.com</Typography>
            </FlexBetween>
            <Typography color={main} m='0.5rem 0' >
                    Your pathway to a stunning jawdropping speecless and imaculate beauty ans make sure that your skin is exfoliating skin and shining like light
            </Typography>
        </WidgetWrapper>
    )

}

export default AdvertWidget;