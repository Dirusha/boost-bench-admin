import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Chart from "chart.js";
import { getAllOrders } from "../../app/features/orders/orderSlice";

export default function CardBarChart() {
  const dispatch = useDispatch();
  const { orders, loadingStates, error } = useSelector((state) => state.orders);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  // Aggregate order counts by month
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const orderCountsCurrentYear = months.map((month, index) => {
    return orders.filter(
      (order) =>
        new Date(order.createdAt).getFullYear() === currentYear &&
        new Date(order.createdAt).getMonth() === index
    ).length;
  });

  const orderCountsLastYear = months.map((month, index) => {
    return orders.filter(
      (order) =>
        new Date(order.createdAt).getFullYear() === lastYear &&
        new Date(order.createdAt).getMonth() === index
    ).length;
  });

  useEffect(() => {
    if (loadingStates.allOrders || error || !chartRef.current) {
      return; // Skip chart creation if loading, error, or canvas not available
    }

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const config = {
      type: "bar",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        datasets: [
          {
            label: currentYear,
            backgroundColor: "#ed64a6",
            borderColor: "#ed64a6",
            data: orderCountsCurrentYear,
            fill: false,
            barThickness: 8,
          },
          {
            label: lastYear,
            fill: false,
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: orderCountsLastYear,
            barThickness: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Orders Chart",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        legend: {
          labels: {
            fontColor: "rgba(0,0,0,.4)",
          },
          align: "end",
          position: "bottom",
        },
        scales: {
          xAxes: [
            {
              display: false,
              scaleLabel: {
                display: true,
                labelString: "Month",
              },
              gridLines: {
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(33, 37, 41, 0.3)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
              },
              gridLines: {
                borderDash: [2],
                drawBorder: false,
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.2)",
                zeroLineColor: "rgba(33, 37, 41, 0.15)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
        },
      },
    };

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, config);

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [
    orderCountsCurrentYear,
    orderCountsLastYear,
    loadingStates.allOrders,
    error,
  ]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              Performance
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              Total Orders
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-350-px">
          {loadingStates.allOrders ? (
            <div className="text-center">Loading chart...</div>
          ) : error ? (
            <div className="text-center">Error: {error}</div>
          ) : orderCountsCurrentYear.every((val) => val === 0) &&
            orderCountsLastYear.every((val) => val === 0) ? (
            <div className="text-center">No orders available</div>
          ) : (
            <canvas id="bar-chart" ref={chartRef}></canvas>
          )}
        </div>
      </div>
    </div>
  );
}
