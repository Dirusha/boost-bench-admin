import React from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";

// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views
import Dashboard from "views/admin/Dashboard.js";
import Settings from "views/admin/Settings.js";
import ProductManagement from "views/admin/ProductManagement";
import UserManagement from "views/admin/UserManagement";
import RoleManagement from "views/admin/RoleManagement";
import CategoryManagement from "views/admin/CategoryManagement";
import TagManagement from "views/admin/TagManagement";
import OrderManagement from "views/admin/OrderManagement";

export default function Admin() {
  const location = useLocation(); // Hook to get the current route

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64">
        {location.pathname === "/admin/dashboard" && (
          <>
            <AdminNavbar />
            <HeaderStats />
          </>
        )}
        <div className="px-4 py-10 mx-auto w-full">
          <Switch>
            <Route
              path="/admin/categorymanagement"
              exact
              component={CategoryManagement}
            />
            <Route
              path="/admin/tagmanagement"
              exact
              component={TagManagement}
            />
            <Route
              path="/admin/productmanagement"
              exact
              component={ProductManagement}
            />
            <Route path="/admin/dashboard" exact component={Dashboard} />
            <Route
              path="/admin/rolemanagement"
              exact
              component={RoleManagement}
            />
            <Route
              path="/admin/usermanagement"
              exact
              component={UserManagement}
            />
            <Route
              path="/admin/ordermanagement"
              exact
              component={OrderManagement}
            />
            <Route path="/admin/settings" exact component={Settings} />
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          {/* <FooterAdmin /> */}
        </div>
      </div>
    </>
  );
}
