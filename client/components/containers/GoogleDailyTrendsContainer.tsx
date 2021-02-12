import React, { useEffect } from "react";
import { Loading } from "../Loading";
import { useGoogleDailyTrends } from "../../hooks";

// TODO: initialize this elsewhere?
const colorPalatte = {
  default: [
    "#072AC8",
    "#1E96FC",
    "#A2D6F9",
    "#FCF300",
    "#FFC600",
    "#93827F",
    "#F3F9D2",
    "#2F2F2F",
    "#EF6F6C",
    "#56E39F",
    //
    "#FCEFEF",
    "#7FD8BE",
    "#A1FCDF",
    "#FCD29F",
    "#FCAB64",
    "#0F0A0A",
    "#BDBF09",
    "#D96C06",
    "#006BA6",
    "#0496FF",
  ],
};
type Props = {
  setColorMap(colorMap: Map<string, string>): void;
};

export function GoogleDailyTrendsContainer({
  children,
  setColorMap,
  ...rest
}: React.PropsWithChildren<Props>) {
  const { status, data, error } = useGoogleDailyTrends();

  // set color map based on the trending topic
  useEffect(() => {
    const colorMap = new Map<string, string>();
    const selectedColorPalatte = "default";
    if (data) {
      data.map((x, i) => {
        colorMap.set(x.title.query, colorPalatte[selectedColorPalatte][i]);
      });
    }

    setColorMap(colorMap);
  }, [data]);

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  if (status === "loading") {
    return <Loading />;
  }

  // ref: https://reactjs.org/docs/react-api.html#cloneelement
  const childrenWithProps = React.Children.map(children, (child) => {
    // checking isValidElement is the safe way and avoids a typescript error too
    const props = {
      googleDailyTrends: data,
      ...rest,
    };

    if (React.isValidElement(child)) {
      return React.cloneElement(child, props);
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}
