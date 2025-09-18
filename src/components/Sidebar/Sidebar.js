/*eslint-disable*/
import React from "react";
import { Link, useHistory } from "react-router-dom"; // Change useNavigate to useHistory
import { useDispatch } from "react-redux";
import { clearAuth } from "../../app/features/auth/authSlice"; // Adjust the path to your authSlice
import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import UserDropdown from "components/Dropdowns/UserDropdown.js";
import Restricted from "components/Restricted";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const dispatch = useDispatch();
  const history = useHistory(); // Use useHistory instead of useNavigate

  const handleLogout = () => {
    dispatch(clearAuth()); // Clear auth state
    history.push("/"); // Use history.push instead of navigate
  };

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-md bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>
          {/* Brand */}
          <Link
            className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
            to="/"
          >
            BoostBench Admin
          </Link>
          {/* User */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>
          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
                    to="/"
                  >
                    BoostBench Admin
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            {/* Form */}
            <form className="mt-6 mb-4 md:hidden">
              <div className="mb-3 pt-0">
                <input
                  type="text"
                  placeholder="Search"
                  className="border-0 px-3 py-2 h-12 border border-solid border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
                />
              </div>
            </form>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />
            {/* Heading */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
              Admin Layout Pages
            </h6>
            {/* Navigation */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <Restricted
                permissions={["USER_READ", "USER_CREATE", "USER_UPDATE"]}
              >
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf("/admin/dashboard") !== -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/dashboard"
                  >
                    <i
                      className={
                        "fas fa-tv mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/dashboard") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Dashboard
                  </Link>
                </li>
              </Restricted>

              <Restricted permissions={["ROLE_MANAGE", "PERMISSION_MANAGE"]}>
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf("/admin/rolemanagement") !==
                      -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/rolemanagement"
                  >
                    <i
                      className={
                        "fas fa-tv mr-2 text-sm " +
                        (window.location.href.indexOf(
                          "/admin/rolemanagement"
                        ) !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Role Management
                  </Link>
                </li>
              </Restricted>

              <Restricted
                permissions={[
                  "USER_READ",
                  "USER_CREATE",
                  "USER_UPDATE",
                  "USER_DELETE",
                ]}
              >
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf("/admin/usermanagement") !==
                      -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/usermanagement"
                  >
                    <i
                      className={
                        "fas fa-tv mr-2 text-sm " +
                        (window.location.href.indexOf(
                          "/admin/usermanagement"
                        ) !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    User Management
                  </Link>
                </li>
              </Restricted>

              <Restricted
                permissions={[
                  "CATEGORY_READ",
                  "CATEGORY_CREATE",
                  "CATEGORY_UPDATE",
                  "CATEGORY_DELETE",
                ]}
              >
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf(
                        "/admin/categorymanagement"
                      ) !== -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/categorymanagement"
                  >
                    <i
                      className={
                        "fas fa-box-open mr-2 text-sm " +
                        (window.location.href.indexOf(
                          "/admin/categorymanagement"
                        ) !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Category Management
                  </Link>
                </li>
              </Restricted>

              <Restricted
                permissions={[
                  "TAG_READ",
                  "TAG_CREATE",
                  "TAG_UPDATE",
                  "TAG_DELETE",
                ]}
              >
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf("/admin/tagmanagement") !==
                      -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/tagmanagement"
                  >
                    <i
                      className={
                        "fas fa-box-open mr-2 text-sm " +
                        (window.location.href.indexOf(
                          "/admin/tagmanagement"
                        ) !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Tag Management{" "}
                    {/* Fixed typo: "Tag reson" to "Tag Management" */}
                  </Link>
                </li>
              </Restricted>

              <Restricted
                permissions={[
                  "PRODUCT_READ",
                  "PRODUCT_CREATE",
                  "PRODUCT_UPDATE",
                  "PRODUCT_DELETE",
                ]}
              >
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf(
                        "/admin/productmanagement"
                      ) !== -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/productmanagement"
                  >
                    <i
                      className={
                        "fas fa-box-open mr-2 text-sm " +
                        (window.location.href.indexOf(
                          "/admin/productmanagement"
                        ) !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Product Management
                  </Link>
                </li>
              </Restricted>

              <Restricted permissions={["PERMISSION_MANAGE"]}>
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf(
                        "/admin/ordermanagement"
                      ) !== -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/ordermanagement"
                  >
                    <i
                      className={
                        "fas fa-tools mr-2 text-sm " +
                        (window.location.href.indexOf(
                          "/admin/ordermanagement"
                        ) !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Order Management
                  </Link>
                </li>
              </Restricted>

              <Restricted permissions={["PERMISSION_MANAGE"]}>
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-bold block " +
                      (window.location.href.indexOf("/admin/settings") !== -1
                        ? "text-lightBlue-500 hover:text-lightBlue-600"
                        : "text-blueGray-700 hover:text-blueGray-500")
                    }
                    to="/admin/settings"
                  >
                    <i
                      className={
                        "fas fa-tools mr-2 text-sm " +
                        (window.location.href.indexOf("/admin/settings") !== -1
                          ? "opacity-75"
                          : "text-blueGray-300")
                      }
                    ></i>{" "}
                    Settings
                  </Link>
                </li>
              </Restricted>

              <li className="items-center">
                <button
                  className={
                    "text-xs uppercase py-3 font-bold block text-blueGray-700 hover:text-blueGray-500"
                  }
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt mr-2 text-sm text-blueGray-300"></i>{" "}
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
