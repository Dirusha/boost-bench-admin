import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Chart from "chart.js";
import { getAllOrders } from "../../app/features/orders/orderSlice";

export default function CardLineChart() {
  const dispatch = useDispatch();
  const { orders, loadingStates, error } = useSelector((state) => state.orders);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  // Aggregate sales value by month
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

  const salesCurrentYear = months.map((month, index) => {
    return orders
      .filter(
        (order) =>
          new Date(order.createdAt).getFullYear() === currentYear &&
          new Date(order.createdAt).getMonth() === index
      )
      .reduce(
        (sum, order) =>
          sum +
          (order.items?.reduce(
            (s, item) => s + item.quantity * item.price,
            0
          ) || 0),
        0
      );
  });

  const salesLastYear = months.map((month, index) => {
    return orders
      .filter(
        (order) =>
          new Date(order.createdAt).getFullYear() === lastYear &&
          new Date(order.createdAt).getMonth() === index
      )
      .reduce(
        (sum, order) =>
          sum +
          (order.items?.reduce(
            (s, item) => s + item.quantity * item.price,
            0
          ) || 0),
        0
      );
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
      type: "line",
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
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: salesCurrentYear,
            fill: false,
          },
          {
            label: lastYear,
            fill: false,
            backgroundColor: "#fff",
            borderColor: "#fff",
            data: salesLastYear,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Sales Charts",
          fontColor: "white",
        },
        legend: {
          labels: {
            fontColor: "white",
          },
          align: "end",
          position: "bottom",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Month",
                fontColor: "white",
              },
              gridLines: {
                display: false,
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(0, 0, 0, 0)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
                fontColor: "white",
              },
              gridLines: {
                borderDash: [3],
                borderDashOffset: [3],
                drawBorder: false,
                color: "rgba(255, 255, 255, 0.15)",
                zeroLineColor: "rgba(33, 37, 41, 0)",
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
  }, [salesCurrentYear, salesLastYear, loadingStates.allOrders, error]);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-blueGray-700">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-100 mb-1 text-xs font-semibold">
              Overview
            </h6>
            <h2 className="text-white text-xl font-semibold">Sales Value</h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-350-px">
          {loadingStates.allOrders ? (
            <div className="text-white text-center">Loading chart...</div>
          ) : error ? (
            <div className="text-white text-center">Error: {error}</div>
          ) : salesCurrentYear.every((val) => val === 0) &&
            salesLastYear.every((val) => val === 0) ? (
            <div className="text-white text-center">
              No sales data available
            </div>
          ) : (
            <canvas id="line-chart" ref={chartRef}></canvas>
          )}
        </div>
      </div>
    </div>
  );
}
