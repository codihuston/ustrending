import React from "react";
import { Loading } from "../Loading";
import { useGoogleRealtimeTrends } from "../../hooks";

export function GoogleRealtimeTrendsContainer({ children }) {
  const { status, data, error } = useGoogleRealtimeTrends();


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
      googleRealtimeTrends: data,
    };

    if (React.isValidElement(child)) {
      return React.cloneElement(child, props);
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}
