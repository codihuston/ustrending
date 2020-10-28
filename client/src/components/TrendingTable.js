import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { AllHtmlEntities } from "html-entities";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  topicRow: {
    width: "100%",
  },
  fixedColumn: {
    width: "50%",
  },
}));

const TrendingTable = ({ dailyTrends, handleOpen }) => {
  const classes = useStyles();
  const rows = dailyTrends;

  return (
    <Box className={classes.root} p={3}>
      <Grid container>
        {rows.map((topic, rank) => {
          const article = topic?.articles?.[0];
          return (
            <Grid
              container
              className="cursor-pointer"
              key={topic?.title?.query}
              onClick={(e) => handleOpen(e, rank)}
            >
              <Grid item xs={1} className={classes.fixedColumn}>
                <Typography variant="h6" component="h2" align={"center"}>
                  {rank + 1}
                </Typography>
              </Grid>
              <Grid item xs={8} md={7} lg={8}>
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
              <Grid item xs={2} sm={3} md={2}>
                <Typography variant="h6" component="h2" align={"center"}>
                  {topic?.formattedTraffic}
                </Typography>
                <Typography variant="subtitle1" component="h2" align={"center"}>
                  searches
                </Typography>
              </Grid>
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
    </Box>
  );
};

export default TrendingTable;
