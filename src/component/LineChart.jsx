import { useRef, useEffect } from "react";
import Chart from 'chart.js/auto'

const LineChart = ({ data, timeRange, displayWpm, displayAccuracy }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");

        // Filter data based on the selected time range
        const filteredData = data.filter(
            (item) => item.dateObj >= timeRange.start && item.dateObj <= timeRange.end
        );

        // Destroy previous chart instance if it exists
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: filteredData.map((item) => item.date),
                datasets: [
                    displayWpm && {
                        label: "Words Per Minute (WPM)",
                        data: filteredData.map((item) => item.wpm),
                        borderColor: "#4caf50",
                        fill: false,
                    },
                    displayAccuracy && {
                        label: "Accuracy (%)",
                        data: filteredData.map((item) => item.accuracy),
                        borderColor: "#2196f3",
                        fill: false,
                    },
                ].filter(Boolean), // Remove falsy values
            },
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, timeRange, displayWpm, displayAccuracy]);

    return <canvas ref={canvasRef}></canvas>;
};

export default LineChart;
