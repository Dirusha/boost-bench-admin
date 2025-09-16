import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";

// layouts
import Admin from "layouts/Admin.js";
import Auth from "layouts/Auth.js";
import PrivateRoute from "components/PrivateRoute";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <PrivateRoute path="/admin" component={Admin} />
          <Route path="/auth" component={Auth} />
          <Route path="/" exact>
            <Redirect to="/auth/login" />
          </Route>
          <Redirect from="*" to="/auth/login" />
        </Switch>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
