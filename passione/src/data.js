// data.js
const outOfStockData = [
{ code: 'CRW-O01JB-9', name: 'Anillo' },
{ code: 'GM-H5600-1', name: 'Reloj' },
{ code: 'GST-B1000D-1A', name: 'Reloj' },
];

const topSalesData = [
{ code: 'GMW-BZ5000RC-1', name: 'Reloj' },
{ code: 'GM-B2100SD-1C', name: 'Reloj' },
{ code: 'CRW-O01JB-9', name: 'Anillo' },
{ code: 'GM-S2110-1A7', name: 'Reloj' },
{ code: 'GST-B1000D-1A', name: 'Reloj' },
];

const lowStockData = [
{ code: 'CRW-O01JB-9', name: 'Anillo', count: 2 },
{ code: 'GM-H5600-1', name: 'Reloj', count: 1 },
{ code: 'GST-B1000D-1A', name: 'Reloj', count: 4 },
];

const metricsData = {
totalProducts: 4,
stockProducts: 20,
shippingOrders: 3,
earnings: '$150.00',
};

export { outOfStockData, topSalesData, lowStockData, metricsData };