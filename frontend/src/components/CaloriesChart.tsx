import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';

interface CaloriesChartProps {
  data: Array<{
    day: string;
    calories: number;
  }>;
}

export const CaloriesChart: React.FC<CaloriesChartProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Calories</Text>
      </View>
      <View style={styles.chart}>
        <VictoryChart
          width={Dimensions.get('window').width - 64}
          height={200}
          padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: { stroke: 'transparent' },
              ticks: { stroke: 'transparent' },
              tickLabels: { fill: '#6B7280', fontSize: 12 },
            }}
          />
          <VictoryLine
            data={data}
            x="day"
            y="calories"
            style={{
              data: { stroke: '#F97316', strokeWidth: 2 },
            }}
          />
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#F97316',
  },
  chart: {
    height: 200,
  },
});