import Drawer from '@mui/material/Drawer';

import './../../styles/components/sidepanel.scss'

const SidePanel = props => {
    const { classes } = props;
    return (
        <Drawer PaperProps={{
            sx: {
                backgroundColor: "#F7F9FB"
            },
            className: "sidepanel"
        }}

            {...props}>
            <div tabIndex={0}>{props.children}</div>
        </Drawer >
    );
};

export default SidePanel
