import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { AllHtmlEntities } from "html-entities";
import invert from "invert-color";

import ColorContext, { colorPalettes } from "../context/ColorContext";
import { addDefaultSrc } from "../lib/utils";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  row: {
    "&:hover": {
      background: "#ebedf5",
    },
  },
  img: {
    minWidth: "100px",
    maxHeight: "100px",
  },
}));

const TrendingTable = ({ dailyTrends, handleOpen }) => {
  const colorPalette = useContext(ColorContext);
  const colors = colorPalettes[colorPalette];
  const classes = useStyles();
  const rows = dailyTrends;

  return (
    <Box className={classes.root} p={3}>
      {!rows ? (
        <Typography align="center">
          No data to display at the moment, please come back later!
        </Typography>
      ) : (
        <Grid container>
          {rows.map((topic, rank) => {
            const article = topic?.articles?.[0];
            const backgroundColor = colors[rank];

            return (
              <Grid
                container
                className={`${classes.row} cursor-pointer`}
                key={topic?.title?.query}
                onClick={(e) => handleOpen(e, rank)}
              >
                <Grid item xs={2} sm={2} md={2} lg={1}>
                  <Box
                    style={{
                      backgroundColor,
                      color: invert(backgroundColor, true),
                    }}
                    marginRight={1}
                    padding={2}
                    height="100%"
                    width="80%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                  >
                    <Typography variant="h6" component="h2" align={"center"}>
                      <Paper>#{rank + 1}</Paper>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={8} sm={6} md={7} lg={8}>
                  <Typography variant="h6" component="h2">
                    {topic?.title?.query}
                  </Typography>
                  <Typography>
                    {article ? (
                      <>
                        <a
                          href={article.url}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {AllHtmlEntities.decode(article.title)}
                        </a>
                        &nbsp;
                        {article.source} – {article.timeAgo}
                      </>
                    ) : (
                      ""
                    )}
                  </Typography>
                </Grid>
                <Box
                  component={Grid}
                  item
                  xs={2}
                  display={{ xs: "none", sm: "none", md: "inline" }}
                >
                  <Grid item xs={2} sm={3} md={2}>
                    <Typography variant="h6" component="h2" align={"center"}>
                      {topic?.formattedTraffic}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="h2"
                      align={"center"}
                    >
                      searches
                    </Typography>
                  </Grid>
                </Box>
                <Box
                  component={Grid}
                  item
                  xs={1}
                  display={{ xs: "none", sm: "none", md: "inline" }}
                >
                  <Grid item xs={1}>
                    {article ? (
                      <>
                        <a
                          href={article.url}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            className={classes.img}
                            alt={
                              "Image for article " +
                              AllHtmlEntities.decode(article.title)
                            }
                            title={AllHtmlEntities.decode(article.title)}
                            src={
                              article.image?.imageUrl
                                ? article.image?.imageUrl
                                : ""
                            }
                            href={article.url}
                            onError={addDefaultSrc}
                          ></img>
                        </a>
                      </>
                    ) : (
                      ""
                    )}
                  </Grid>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default TrendingTable;
