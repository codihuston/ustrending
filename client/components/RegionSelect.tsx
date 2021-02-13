import Select, { Props as SelectProps, ValueType } from "react-select";

import { GoogleRegionTrend, RegionSelectOptionType } from "../types";

type Props = {
  values: ValueType<RegionSelectOptionType, true>;
  googleDailyTrendsByState: GoogleRegionTrend[];
  handleChange(option: ValueType<RegionSelectOptionType, true>): void;
};

export function RegionSelect({
  values,
  googleDailyTrendsByState,
  handleChange,
}: Props) {
  if (!googleDailyTrendsByState || !googleDailyTrendsByState.length) {
    return <span>Error: no google daily trends are provided!</span>;
  }

  const options: RegionSelectOptionType[] = googleDailyTrendsByState
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
        isMulti={true}
        value={values}
        isSearchable={true}
        onChange={handleChange}
        options={options}
      ></Select>
    </>
  );
}
