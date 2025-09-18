import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CardStats from "components/Cards/CardStats.js";
import { getAllOrders } from "../../app/features/orders/orderSlice";
import { getProducts } from "../../app/features/products/productSlice";
import { getUsers } from "../../app/features/user/userSlice";

export default function HeaderStats() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);
  const { users } = useSelector((state) => state.user);


  console.log("Orders in HeaderStats:", orders);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getAllOrders());
    dispatch(getUsers());
  }, [dispatch]);

  // Helper function to calculate percentage change and trend
  const calculatePercentChange = (currentCount, previousCount) => {
    const percentChange =
      previousCount === 0
        ? currentCount > 0
          ? "100"
          : "0"
        : (((currentCount - previousCount) / previousCount) * 100).toFixed(2);
    const arrow = currentCount >= previousCount ? "up" : "down";
    const percentColor =
      currentCount >= previousCount ? "text-emerald-500" : "text-red-500";
    return { percentChange, arrow, percentColor };
  };

  // Current and previous month for filtering
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Products: Current vs. previous month
  const productsCurrent = products.filter(
    (product) =>
      new Date(product.createdAt).getFullYear() === currentYear &&
      new Date(product.createdAt).getMonth() === currentMonth
  ).length;
  const productsPrevious = products.filter(
    (product) =>
      new Date(product.createdAt).getFullYear() === previousMonthYear &&
      new Date(product.createdAt).getMonth() === previousMonth
  ).length;
  const {
    percentChange: productsPercent,
    arrow: productsArrow,
    percentColor: productsPercentColor,
  } = calculatePercentChange(productsCurrent, productsPrevious);

  // Users: Current vs. previous month
  const usersCurrent = users.filter(
    (user) =>
      new Date(user.createdAt).getFullYear() === currentYear &&
      new Date(user.createdAt).getMonth() === currentMonth
  ).length;
  const usersPrevious = users.filter(
    (user) =>
      new Date(user.createdAt).getFullYear() === previousMonthYear &&
      new Date(user.createdAt).getMonth() === previousMonth
  ).length;
  const {
    percentChange: usersPercent,
    arrow: usersArrow,
    percentColor: usersPercentColor,
  } = calculatePercentChange(usersCurrent, usersPrevious);

  // Orders: Current vs. previous month
  const ordersCurrent = orders.filter(
    (order) =>
      new Date(order.createdAt).getFullYear() === currentYear &&
      new Date(order.createdAt).getMonth() === currentMonth
  ).length;
  const ordersPrevious = orders.filter(
    (order) =>
      new Date(order.createdAt).getFullYear() === previousMonthYear &&
      new Date(order.createdAt).getMonth() === previousMonth
  ).length;
  const {
    percentChange: ordersPercent,
    arrow: ordersArrow,
    percentColor: ordersPercentColor,
  } = calculatePercentChange(ordersCurrent, ordersPrevious);

  // Sales: Current vs. previous year
  const totalSales = orders
    .reduce(
      (sum, order) =>
        sum +
        (order.items?.reduce((s, item) => s + item.quantity * item.price, 0) ||
          0),
      0
    )
    .toFixed(2);
  const salesCurrentYear = orders
    .filter((order) => new Date(order.createdAt).getFullYear() === currentYear)
    .reduce(
      (sum, order) =>
        sum +
        (order.items?.reduce((s, item) => s + item.quantity * item.price, 0) ||
          0),
      0
    );
  const salesLastYear = orders
    .filter(
      (order) => new Date(order.createdAt).getFullYear() === currentYear - 1
    )
    .reduce(
      (sum, order) =>
        sum +
        (order.items?.reduce((s, item) => s + item.quantity * item.price, 0) ||
          0),
      0
    );
  const {
    percentChange: salesPercent,
    arrow: salesArrow,
    percentColor: salesPercentColor,
  } = calculatePercentChange(salesCurrentYear, salesLastYear);

  return (
    <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div>
          {/* Card stats */}
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Products"
                statTitle={products.length.toString()}
                statArrow={productsArrow}
                statPercent={productsPercent}
                statPercentColor={productsPercentColor}
                statDescription="Since last month"
                statIconName="far fa-chart-bar"
                statIconColor="bg-red-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Users"
                statTitle={users.length.toString()}
                statArrow={usersArrow}
                statPercent={usersPercent}
                statPercentColor={usersPercentColor}
                statDescription="Since last month"
                statIconName="fas fa-users"
                statIconColor="bg-orange-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Orders"
                statTitle={orders.length.toString()}
                statArrow={ordersArrow}
                statPercent={ordersPercent}
                statPercentColor={ordersPercentColor}
                statDescription="Since last month"
                statIconName="fas fa-shopping-cart"
                statIconColor="bg-pink-500"
              />
            </div>
            <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
              <CardStats
                statSubtitle="Sales"
                statTitle={`$${totalSales}`}
                statArrow={salesArrow}
                statPercent={salesPercent}
                statPercentColor={salesPercentColor}
                statDescription="Since last year"
                statIconName="fas fa-dollar-sign"
                statIconColor="bg-lightBlue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
