import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Typography } from "antd";

const { Title } = Typography;

const TargetLesionsChart = ({ data, dataDate, name_chart, hideChart }) => {
  const getNadir = (data, dataDate) => {
    const endDate = new Date();
    endDate.setHours(23);
    endDate.setMinutes(59);
    const dates = Object.keys(dataDate[0]).filter((key) => {
      return dataDate[0][key] && new Date(dataDate[0][key]) < endDate && key;
    });

    if (dates.length == 0) return 0;
    if (dates.length == 1)
      return Number(data.reduce((acc, row) => acc + row[dates[0]], 0)) || 0;

    const values = dates.map(
      (date) => Number(data.reduce((acc, row) => acc + row[date], 0)) || 0
    );
    values.pop();

    return Math.min(...values);
  };

  const sumSLD = (tp) => data.reduce((acc, row) => acc + row[tp], 0);

  const chartData = useMemo(
    () =>
      Object.keys(data[0])
        .filter((key) => key != "location")
        .map((key) => ({
          date: dataDate[0][key],
          sld: sumSLD(key),
        }))
        .filter((d) => d.date),
    [data, dataDate]
  );

  return (
    <>
      <LineChart
        width={700}
        height={300}
        data={chartData}
        margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[50, 200]} />
        <Tooltip />
        <ReferenceLine
          y={sumSLD("baseline") * 0.7}
          stroke="red"
          label={{
            value: "PR: -30% from baseline",
            position: "insideRight",
            fill: "red",
          }}
          strokeDasharray="3 3"
        />
        <ReferenceLine
          y={Math.floor(getNadir(data, dataDate) * 1.2)}
          stroke="red"
          label={{
            value: "PD: +20% from nadir",
            position: "insideRight",
            fill: "red",
          }}
          strokeDasharray="3 3"
        />
        <Line type="monotone" dataKey="sld" stroke="#8884d8" dot={{ r: 4 }} />
      </LineChart>
      <Title
        level={5}
        style={{ marginTop: 24, fontStyle: "italic", fontSize: 11 }}
      >
        {name_chart}
      </Title>
      <div
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "grey",
          marginBottom: 100,
        }}
      ></div>
    </>
  );
};

export default TargetLesionsChart;
