import invert from "invert-color";

import { GoogleDailyTrend } from "../types";
import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";

type Props = {
  googleDailyTrends: GoogleDailyTrend[];
  colorMap: Map<string, string>;
  withColor: boolean;
};

export function GoogleDailyTrendsList({
  colorMap,
  googleDailyTrends,
  withColor,
}: Props) {
  if (!googleDailyTrends || !googleDailyTrends.length) {
    return <span>Error: no google daily trends are provided!</span>;
  }
  
  return (
    <Box>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={3}
      >
        <List>
          <ListItem>
            <ListItemText style={{ textAlign: "center" }}>
              United States
            </ListItemText>
          </ListItem>
          <Divider />
          {googleDailyTrends.map((trend, i) => {
            const color = colorMap.get(trend.title.query);
            const background = color ? color : "#000000";
            const textColor = color
              ? invert(color, true)
              : invert(background, true);

            return (
              <ListItem key={i}>
                <Box display="flex" width={"100%"}>
                  {withColor ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      width={"3rem"}
                      style={{
                        background,
                        color: textColor,
                        borderRadius: "2px",
                        textAlign: "center",
                      }}
                    >
                      <ListItemText>
                        <b>{i + 1}</b>
                      </ListItemText>
                    </Box>
                  ) : (
                    <Box>
                      <ListItemText>
                        <b>{i + 1}</b>
                      </ListItemText>
                    </Box>
                  )}
                  <Box ml={2} flexGrow={1}>
                    <ListItemText>{trend.title.query}</ListItemText>
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Grid>
    </Box>
  );
}
