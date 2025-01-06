import React from "react";
import { Avatar, AppBar, Toolbar, Typography, Box, Tooltip, IconButton, Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";


function Navbar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const theme = useTheme();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        console.log("Cerrar sesión");
    };

    const logo = require("../assets/images/LOGO ADSIGHT SIN LETRAS.png");

    return (
        <React.Fragment>
            <AppBar position="sticky" sx={{ backgroundColor: theme.palette.background.paper }}>
                <Toolbar>
                    <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", color: "white" }}>
                        <img
                            src={logo}
                            alt="Adsight Analytics Logo"
                            style={{
                                width: "50px", // Tamaño más grande
                                height: "50px",
                                borderRadius: "50%", // Bordes circulares
                                marginRight: 4, // Espacio entre el logo y el texto
                            }}
                        />
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ ml: 2 }}
                            fontWeight={"bold"}
                            color={theme.palette.primary.main}
                        >
                            Adsight Analytics
                        </Typography>
                    </Link>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography
                        variant="h5"
                        component="div"
                        noWrap
                        sx={{
                            display: {
                                xs: "none",
                                md: "flex"
                            },
                            fontStyle: "italic",
                            pr: 1,
                            mr: 1,
                        }}
                    >
                        Juan Vásquez
                    </Typography>
                    <Tooltip title={"Configuración"} placement="bottom" arrow>
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            sx={{ ml: 2 }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 32, height: 32 }}>J</Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        id="account-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem component={Link} to="/mi-cuenta" onClick={handleClose}>
                            <ListItemIcon>
                                <AccountCircleIcon fontSize="small" />
                            </ListItemIcon>
                            Mi cuenta
                        </MenuItem>
                        <MenuItem component={Link} to="/ajustes" onClick={handleClose}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Ajustes
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Cerrar Sesión
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    );
}

export default Navbar;
