exports.ports = {
  auth: 6001,
  tickets: 6002,
  orders: 6003,
  payments: 6004,
};

exports.isAuthUrl = (urlPath) => {
  return urlPath.includes("/api/users");
};

exports.isTicketUrl = (urlPath) => {
  return urlPath.includes("/api/tickets");
};

exports.isOrdersUrl = (urlPath) => {
  return urlPath.includes("/api/orders");
};

exports.isPaymentsUrl = (urlPath) => {
  return urlPath.includes("/api/payments");
};
