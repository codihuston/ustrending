import React, { memo, useState } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";

import MapChart from "../components/MapChart";
import TopicDetailModal from "../components/TopicDetailModal";

const useStyles = makeStyles((theme) => ({
  invisible: {
    visibility: "hidden",
  },
}));

function MapPage(props) {
  const classes = useStyles();
  const { dailyTrends, dailyTrendsByState } = props;
  const [open, setOpen] = useState(false);
  const [buttonText, setButtonText] = useState(null);
  // TODO: make modal function based on a given dailyTrends instead of index?
  const [selectedTopicNumber, setSelectedTopicNumber] = useState(null);

  const handleClick = (event, name) => {
    if (name) {
      // get trends for this state
      const dailyStateTrends = dailyTrendsByState.get(name);
      if (dailyStateTrends?.[0]?.topic) {
        const topic = dailyStateTrends[0].topic;
        // get the index of the selected topic
        const index = dailyTrends.findIndex((trend) => {
          return topic === trend?.title?.query;
        });
        // display modal with articles on the topic
        if (index >= 0) {
          setSelectedTopicNumber(index);
          setButtonText(`${name} (${topic})`);
        }
      } else {
        console.warn(`No daily trends found for '${name}'.`);
      }
    } else {
      console.warn("Unable to obtain geography properties on click");
    }
  };

  const handleOpen = (event, geo) => {
    if (selectedTopicNumber >= 0) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTopicNumber(null);
  };

  return (
    <Paper>
      <Box p={3}>
        <Typography variant="h2">Trending Map</Typography>
        <Typography paragraph>
          Below is a color-coded map that will display the top Google Trends for
          each U.S. state for today. Note that these are the most googled
          searches for the duration of the day—it is <i>not</i> indicative of
          what is trending at this current moment. The colors are assigned by
          <i> topic rank</i> rather than by topic title. For example, if topic A
          is trending #10, then reaches #2, its color would change according to
          the <Link to="/settings">color palette settings</Link>.
        </Typography>
        <Box mb={3}>
          <Alert severity="info">
            Note: It is normal for there to be fewer topics towards the
            beginning of the day. The map will display more topics as google
            updates their trending searches throughout the day, typically on
            hourly intervals.
          </Alert>
        </Box>
        <Box fontStyle="italic">
          <Typography
            paragraph
            align="center"
            variant="subtitle1"
            color="textSecondary"
          >
            Click / hover / tap on a state to get trending information for that
            state!
          </Typography>
        </Box>
        <Box
          align="center"
          className={buttonText ? "" : classes.invisible}
          mb={3}
        >
          <Button
            onClick={handleOpen}
            variant="contained"
            color="primary"
            m="auto"
          >
            Click Here for News About #1 in {buttonText}
          </Button>
        </Box>
        <MapChart {...props} handleClick={handleClick} />
        {dailyTrends && dailyTrends[selectedTopicNumber] ? (
          <TopicDetailModal
            topic={dailyTrends[selectedTopicNumber]}
            rank={selectedTopicNumber}
            open={open}
            handleClose={handleClose}
          />
        ) : (
          ""
        )}
      </Box>
    </Paper>
  );
}

export default memo(withRouter(MapPage));
