import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { IconContext } from "react-icons";
import { GrFormNextLink } from "react-icons/gr";
import { IoMdCodeWorking } from "react-icons/io";
import { DiGoogleCloudPlatform } from "react-icons/di";
import {
  SiReact,
  SiMaterialUi,
  SiNodeDotJs,
  SiRedis,
  SiDocker,
  SiKubernetes,
  SiTravisci,
} from "react-icons/si";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

function AboutPage() {
  const classes = useStyles();

  return (
    <IconContext.Provider value={{ size: "2em" }}>
      <Paper>
        <Box p={3}>
          <Typography variant="h2">About</Typography>
          <Typography paragraph>
            The primary purpose of this app is to provide a means of seeing
            trending data on a per U.S. state basis, and is sourced from{" "}
            <a href="https://trends.google.com/trends">Google Trends</a>. Google
            Trends' Daily Trends does offer a means of seeing how popular
            certain trends are per state, but it does not do so in a manner that
            shows you the distribution of trends across all states in one view
            (from what I could find).
          </Typography>
          <Typography paragraph>
            This project was designed for the sake of working and learning
            modern technology stacks and taking them into production in a
            scalable fashion. As with all professions, it is important to evolve
            with the times.
          </Typography>
          <Typography paragraph>
            I wanted to make a Single Page Application that was both intriguing
            while being able to focus on the tech that I wanted to learn about.
            Overall, this was a very statisfying project to work on. The idea
            was simple enough that it allowed me to focus on its larger
            components (in terms of infrastructure) rather than any real
            implementation details (such as authentication/authorization, and
            create/read/update/delete operations).
          </Typography>
          <Typography variant="h2">Technical Details</Typography>
          <Typography paragraph>
            The tech stack and implementation details are discussed below.
          </Typography>
          <Typography variant="h3">Product Overview</Typography>
          <Typography paragraph>
            In order to display the top trends on a state-by-state basis, I
            needed to first fetch Google's top trends. For each of those, I then
            needed to determine where each trend ranked for each state. Once I
            processed that data into a sorted list of trends per state, I could
            plug that into the map/table views as demonstrated.
          </Typography>
          <Typography variant="h3">Front End</Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SiReact />
              </ListItemIcon>
              <ListItemText primary="React"></ListItemText>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SiMaterialUi />
              </ListItemIcon>
              <ListItemText primary="Material-UI"></ListItemText>
            </ListItem>
          </List>
          <Typography variant="h3">Back End</Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SiNodeDotJs />
              </ListItemIcon>
              <ListItemText primary="Node.js"></ListItemText>
            </ListItem>
            <List component="div" disablePadding>
              <ListItem className={classes.nested}>
                <ListItemIcon>
                  <GrFormNextLink />
                </ListItemIcon>
                <ListItemText primary="Express.js: serves cached data from Redis to the front-end application" />
              </ListItem>
              <ListItem className={classes.nested}>
                <ListItemIcon>
                  <IoMdCodeWorking />
                </ListItemIcon>
                <ListItemText primary="Worker Process: populates the Redis cache on a delta interval" />
              </ListItem>
            </List>
            <ListItem>
              <ListItemIcon>
                <SiRedis />
              </ListItemIcon>
              <ListItemText primary="Redis: caches the trending data from 3rd party sources"></ListItemText>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SiDocker />
              </ListItemIcon>
              <ListItemText primary="Docker: each of the services are containerized"></ListItemText>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SiKubernetes />
              </ListItemIcon>
              <ListItemText primary="Kubernetes: in conjunction with Skaffold, used to make the developer experience from development to production more seamless"></ListItemText>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SiTravisci />
              </ListItemIcon>
              <ListItemText primary="TravisCI: used to deploy to production"></ListItemText>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DiGoogleCloudPlatform />
              </ListItemIcon>
              <ListItemText primary="Google Kubernetes Engine: the production environment for these services"></ListItemText>
            </ListItem>
          </List>
          <Typography variant="h2">About the Author</Typography>
          <Typography paragraph>
            This application was developed by{" "}
            <a href="https://www.linkedin.com/in/codi-huston/">
              Codi Huston (LinkedIn)
            </a>
            . You can view the source code at{" "}
            <a href="https://github.com/codihuston/ustrending">Github.com</a>.
          </Typography>
          <Typography paragraph>
            If you think this project is interesting and worth keeping up for
            use by the general public, please consider{" "}
            <a href="https://paypal.me/codihuston">Donating via Paypal</a>, as
            this project is not monitized. Any proceeds will be used to keep
            this website running. Donations are solely attributed to supporting
            the developer for the purposes of this (and future) projects. Donate
            at your discretion.
          </Typography>
        </Box>
      </Paper>
    </IconContext.Provider>
  );
}

export default AboutPage;
