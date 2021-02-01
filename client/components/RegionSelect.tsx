import Select, { Props as SelectProps, ValueType } from "react-select";

import { GoogleRegionTrend } from "../types";

type Props = {
  googleDailyTrendsByState: GoogleRegionTrend[];
  handleChange(option: ValueType<OptionType, false>): void;
};

export type OptionType = { label: string; value: string };

export function RegionSelect({
  googleDailyTrendsByState,
  handleChange,
}: Props) {
  if (!googleDailyTrendsByState || !googleDailyTrendsByState.length) {
    return <span>Error: no google daily trends are provided!</span>;
  }

  const options: OptionType[] = googleDailyTrendsByState
    .sort((a, b) => {
      const x = a.name.toUpperCase();
      const y = b.name.toUpperCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    })
    .map((x) => ({
      value: x.name,
      label: x.name,
    }));

  return (
    <>
      <Select
        isSearchable={true}
        onChange={handleChange}
        options={options}
      ></Select>
    </>
  );
}
