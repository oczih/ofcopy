import React from "react";
import { Card, Stack, Typography, Box } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface MiniGraphCardProps<T extends object> {
  title: string;
  total: number;
  data: T[];
  dataKey: keyof T;                 // ✅ must be a key of T
  xKey?: keyof T;                   // ✅ allow custom X-axis key
  lineColor: string;
  subtitle?: string;
  chartType?: "line" | "bar";
}

export function MiniGraphCard<T extends object>({
  title,
  total,
  data,
  dataKey,
  xKey,                             // ← new optional prop
  lineColor,
  subtitle,
  chartType = "line",
}: MiniGraphCardProps<T>) {
  return (
    <Card
      sx={{
        bgcolor: "rgba(255,255,255,0.05)",
        boxShadow: 1,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack spacing={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        <Stack spacing={0} alignItems="flex-start">
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            $
            {total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {subtitle}
            </Typography>
          )}
        </Stack>

        <Box sx={{ width: "100%", height: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <Tooltip
                  formatter={(val: number) => [
                    `$${Number(val).toFixed(2)}`,
                    "Value",
                  ]}
                  contentStyle={{
                    backgroundColor: "#222",
                    borderRadius: 4,
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey as string}
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: lineColor, strokeWidth: 1 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey={xKey as string}       // ✅ configurable
                  stroke="#ffffff80"
                  fontSize={10}
                />
                <YAxis stroke="#ffffff80" fontSize={10} />
                <Tooltip
                  formatter={(val: number) => [
                    `$${Number(val).toFixed(2)}`,
                    "Value",
                  ]}
                  contentStyle={{
                    backgroundColor: "#222",
                    borderRadius: 4,
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Bar dataKey={dataKey as string} fill={lineColor} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Stack>
    </Card>
  );
}
