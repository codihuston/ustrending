import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Alert from "@material-ui/lab/Alert";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import MapIcon from "@material-ui/icons/Map";
import TableChartIcon from "@material-ui/icons/TableChart";
import InfoIcon from "@material-ui/icons/Info";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SettingsIcon from "@material-ui/icons/Settings";

import AboutPage from "../pages/AboutPage";
import MapViewPage from "../pages/MapPage";
import MapPageTwitter from "../pages/MapPageTwitter";
import TableViewPage from "../pages/TablePage";
import TrendingTodayPage from "../pages/TrendingTodayPage";
import SettingsPage from "../pages/SettingsPage";
import ListItemLink from "./ListItemLink";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

function ResponsiveDrawer(props) {
  const { window, handleChangeColors } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <List>
        <ListItemLink
          icon={<TrendingUpIcon />}
          primary={"Trending Today"}
          to={"/trending"}
        />
        <ListItemLink icon={<MapIcon />} primary={"Map"} to={"/"} />
        <ListItemLink icon={<MapIcon />} primary={"Twitter"} to={"/twitter"} />
        <ListItemLink
          icon={<TableChartIcon />}
          primary={"Table"}
          to={"/table"}
        />
      </List>
      <Divider />
      <List>
        <ListItemLink
          icon={<SettingsIcon />}
          primary={"Settings"}
          to={"/settings"}
        />
      </List>
      <List>
        <ListItemLink
          icon={<InfoIcon />}
          primary={"About This App"}
          to={"/about"}
        />
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <Router>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              United States Trending
            </Typography>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer} aria-label="mailbox folders">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden mdUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {props.error ? (
            <Alert variant="filled" severity="error">
              There was a problem fetching data from our servers :(. Please
              check back in a little while!
            </Alert>
          ) : null}
          <Switch>
            <Route path="/About" render={() => <AboutPage {...props} />} />
            <Route path="/table" render={() => <TableViewPage {...props} />} />
            <Route
              path="/trending"
              render={() => <TrendingTodayPage {...props} />}
            />
            <Route
              path="/settings"
              render={() => <SettingsPage {...props} />}
            />
            <Route
              path="/twitter"
              render={() => <MapPageTwitter {...props} />}
            />
            <Route path="/" render={() => <MapViewPage {...props} />} />
          </Switch>
        </main>
      </Router>
    </div>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
