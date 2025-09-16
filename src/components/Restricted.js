import React from "react";
import { useSelector } from "react-redux";

const Restricted = ({
  permission,
  permissions,
  requireAll = false,
  children,
}) => {
  const { permissions: userPermissions } = useSelector((state) => state.auth);

  if (!permission && !permissions) {
    return null;
  }

  if (!userPermissions || userPermissions.length === 0) {
    return null;
  }

  let hasPermission = false;

  if (permission) {
    hasPermission = userPermissions.includes(permission);
  } else if (permissions) {
    if (requireAll) {
      hasPermission = permissions.every((perm) =>
        userPermissions.includes(perm)
      );
    } else {
      hasPermission = permissions.some((perm) =>
        userPermissions.includes(perm)
      );
    }
  }

  return hasPermission ? <>{children}</> : null;
};

export default Restricted;
