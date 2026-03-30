/* eslint-disable no-console */
const prisma = require('../config/prisma');

const base = 'http://localhost:5000/api';
const password = 'TestPass123';

const postJson = async (url, token, body = {}) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`POST ${url} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
};

const patchJson = async (url, token, body = {}) => {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`PATCH ${url} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
};

const getJson = async (url, token) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
};

(async () => {
  const ts = Date.now();
  const customerEmail = `smoke.customer.${ts}@yumzo.test`;
  const driverEmail = `smoke.driver.${ts}@yumzo.test`;
  const adminEmail = `smoke.admin.${ts}@yumzo.test`;

  try {
    const health = await fetch('http://localhost:5000/health');
    if (!health.ok) throw new Error('Backend health check failed');

    await postJson(`${base}/auth/signup`, null, {
      name: 'Smoke Customer',
      email: customerEmail,
      password,
      role: 'customer',
    });

    await postJson(`${base}/auth/signup`, null, {
      name: 'Smoke Driver',
      email: driverEmail,
      password,
      role: 'driver',
    });

    await postJson(`${base}/auth/signup`, null, {
      name: 'Smoke Admin',
      email: adminEmail,
      password,
      role: 'customer',
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'admin' },
    });

    const customerLogin = await postJson(`${base}/auth/login`, null, { email: customerEmail, password });
    const driverLogin = await postJson(`${base}/driver/login`, null, { email: driverEmail, password });
    const adminLogin = await postJson(`${base}/auth/login`, null, { email: adminEmail, password });

    const customerToken = customerLogin.data.accessToken;
    const driverToken = driverLogin.data.accessToken;
    const adminToken = adminLogin.data.accessToken;

    const restaurants = await getJson(`${base}/user/restaurants`, customerToken);
    const restaurant = restaurants?.data?.restaurants?.[0];
    if (!restaurant) throw new Error('No restaurant found for smoke test');

    const menu = await getJson(`${base}/user/restaurants/${restaurant.id}/menu`, customerToken);
    const menuItem = menu?.data?.menuItems?.[0];
    if (!menuItem) throw new Error('No menu item found for smoke test');

    await postJson(`${base}/user/cart`, customerToken, {
      menu_item_id: menuItem.id,
      quantity: 1,
    });

    const cart = await getJson(`${base}/user/cart`, customerToken);

    const orderRes = await postJson(`${base}/user/orders`, customerToken, {
      delivery_address: 'Smoke Test Address, Yumzo City',
    });
    const orderId = orderRes?.data?.order?.id;
    if (!orderId) throw new Error('Order creation did not return order id');

    await postJson(`${base}/user/payments/${orderId}`, customerToken, {
      payment_method: 'card',
      payment_details: 'smoke-test',
    });

    const availableOrders = await getJson(`${base}/driver/orders/available`, driverToken);
    const createdOrderVisible = (availableOrders?.data?.orders || []).some((o) => o.id === orderId);
    if (!createdOrderVisible) {
      throw new Error(`Created order ${orderId} not visible to driver as available order`);
    }

    await postJson(`${base}/driver/orders/${orderId}/accept`, driverToken, {});
    await patchJson(`${base}/driver/orders/${orderId}/status`, driverToken, { status: 'picked_up' });
    await patchJson(`${base}/driver/orders/${orderId}/status`, driverToken, { status: 'out_for_delivery' });
    await patchJson(`${base}/driver/orders/${orderId}/status`, driverToken, { status: 'delivered' });

    const dashboard = await getJson(`${base}/admin/dashboard`, adminToken);
    const adminOrders = await getJson(`${base}/admin/orders`, adminToken);

    const reels = await getJson(`${base}/user/reels`, customerToken);
    const firstReel = reels?.data?.reels?.[0];
    if (firstReel) {
      await postJson(`${base}/user/reels/${firstReel.id}/like`, customerToken, {});
      await postJson(`${base}/user/reels/${firstReel.id}/comments`, customerToken, { comment: 'Smoke test comment' });
    }

    console.log('SMOKE TEST RESULT: PASS');
    console.log(`Customer: ${customerEmail}`);
    console.log(`Driver:   ${driverEmail}`);
    console.log(`Admin:    ${adminEmail}`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Cart item count: ${cart?.count || 0}`);
    console.log(`Admin orders count: ${adminOrders?.count || 0}`);
    console.log(`Admin total users: ${dashboard?.data?.stats?.total_users || 0}`);
  } catch (error) {
    console.error('SMOKE TEST RESULT: FAIL');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
