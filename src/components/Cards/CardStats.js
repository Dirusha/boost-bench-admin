import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { getProducts } from "../../app/features/products/productSlice";
import { getAllOrders } from "../../app/features/orders/orderSlice"; // Changed from getOrders to getAllOrders
import { getUsers } from "../../app/features/user/userSlice";

export default function CardStats({
  statSubtitle,
  statTitle,
  statArrow,
  statPercent,
  statPercentColor,
  statDescription,
  statIconName,
  statIconColor,
}) {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { orders } = useSelector((state) => state.orders);
  const { users } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getAllOrders()); // Changed from getOrders to getAllOrders
    dispatch(getUsers());
  }, [dispatch]);

  // Example: Calculate dynamic stats based on data type
  let dynamicTitle = statTitle;
  let dynamicPercent = statPercent;
  let dynamicArrow = statArrow;

  if (statSubtitle === "Products") {
    dynamicTitle = products.length.toString();
    dynamicPercent = products.length > 0 ? "10" : "0"; // Example percentage
    dynamicArrow = products.length > 0 ? "up" : "down";
  } else if (statSubtitle === "Orders") {
    dynamicTitle = orders.length.toString();
    dynamicPercent = orders.length > 0 ? "5" : "0";
    dynamicArrow = orders.length > 0 ? "up" : "down";
  } else if (statSubtitle === "Users") {
    dynamicTitle = users.length.toString();
    dynamicPercent = users.length > 0 ? "8" : "0";
    dynamicArrow = users.length > 0 ? "up" : "down";
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
      <div className="flex-auto p-4">
        <div className="flex flex-wrap">
          <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
            <h5 className="text-blueGray-400 uppercase font-bold text-xs">
              {statSubtitle}
            </h5>
            <span className="font-semibold text-xl text-blueGray-700">
              {dynamicTitle}
            </span>
          </div>
          <div className="relative w-auto pl-4 flex-initial">
            <div
              className={
                "text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " +
                statIconColor
              }
            >
              <i className={statIconName}></i>
            </div>
          </div>
        </div>
        <p className="text-sm text-blueGray-400 mt-4">
          <span className={statPercentColor + " mr-2"}>
            <i
              className={
                dynamicArrow === "up"
                  ? "fas fa-arrow-up"
                  : dynamicArrow === "down"
                  ? "fas fa-arrow-down"
                  : ""
              }
            ></i>{" "}
            {dynamicPercent}%
          </span>
          <span className="whitespace-nowrap">{statDescription}</span>
        </p>
      </div>
    </div>
  );
}

CardStats.defaultProps = {
  statSubtitle: "Products",
  statTitle: "0",
  statArrow: "up",
  statPercent: "0",
  statPercentColor: "text-emerald-500",
  statDescription: "Since last month",
  statIconName: "far fa-chart-bar",
  statIconColor: "bg-red-500",
};

CardStats.propTypes = {
  statSubtitle: PropTypes.string,
  statTitle: PropTypes.string,
  statArrow: PropTypes.oneOf(["up", "down"]),
  statPercent: PropTypes.string,
  statPercentColor: PropTypes.string,
  statDescription: PropTypes.string,
  statIconName: PropTypes.string,
  statIconColor: PropTypes.string,
};
