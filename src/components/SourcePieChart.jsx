import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// A set of nice colors for our chart slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

// This function processes the raw articles array into data for the chart
const processData = (articles) => {
  if (!articles) return [];

  const sourceCounts = articles.reduce((acc, article) => {
    const sourceName = article.source.name || 'Unknown Source';
    acc[sourceName] = (acc[sourceName] || 0) + 1;
    return acc;
  }, {});

  // Format the data into the structure Recharts expects: [{ name: 'CNN', value: 5 }, ...]
  return Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort to show largest sources first
};

function SourcePieChart({ articles }) {
  // useMemo prevents reprocessing the data on every render, just like in your word cloud
  const chartData = useMemo(() => processData(articles), [articles]);

  if (chartData.length === 0) {
    return <p>No source data available to display chart.</p>;
  }

  return (
    // ResponsiveContainer makes the chart fill its parent div
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%" // Center X
          cy="50%" // Center Y
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value" // The key in our data object that holds the numerical value
          nameKey="name"  // The key that holds the name for the tooltip
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        {/* Tooltip shows details when you hover over a slice */}
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default SourcePieChart;