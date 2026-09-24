/**
 * Weekly Inventory Report Service for Nigerian Retail SMEs
 */

import { Product, Sale, Restock, Report } from './types';

export class ReportService {
  public generateWeeklyReport(
    businessId: string,
    products: Product[],
    sales: Sale[],
    restocks: Restock[],
    startDate?: string,
    endDate?: string
  ): Report {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Filter sales in period
    const periodSales = sales.filter((s) => s.sale_date >= startStr && s.sale_date <= endStr);
    const periodRestocks = restocks.filter((r) => r.restock_date >= startStr && r.restock_date <= endStr);

    // Sales summary
    const totalSalesAmount = periodSales.reduce((acc, s) => acc + s.total_amount, 0);
    const totalUnitsSold = periodSales.reduce((acc, s) => acc + s.quantity, 0);
    const totalTransactions = periodSales.length;

    // Top selling products
    const productSalesMap = new Map<string, { units: number; revenue: number; name: string }>();
    for (const s of periodSales) {
      const prod = products.find((p) => p.id === s.product_id);
      const name = prod ? prod.name : 'Unknown Product';
      const item = productSalesMap.get(s.product_id) || { units: 0, revenue: 0, name };
      item.units += s.quantity;
      item.revenue += s.total_amount;
      productSalesMap.set(s.product_id, item);
    }

    const topSellingProducts = Array.from(productSalesMap.entries())
      .map(([id, data]) => ({
        product_id: id,
        product_name: data.name,
        units: data.units,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Inventory summary
    let healthyCount = 0;
    let lowStockCount = 0;
    let reorderCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;

    for (const p of products) {
      totalInventoryValue += p.current_stock * p.cost_price;
      const rop = p.reorder_point ?? p.reorder_level;
      if (p.current_stock <= 0) {
        outOfStockCount++;
      } else if (p.current_stock <= rop) {
        reorderCount++;
      } else if (p.current_stock <= rop * 1.3) {
        lowStockCount++;
      } else {
        healthyCount++;
      }
    }

    // Restocking summary
    const totalRestockedUnits = periodRestocks.reduce((acc, r) => acc + r.quantity, 0);
    const totalRestockingCost = periodRestocks.reduce((acc, r) => acc + r.total_cost, 0);

    const restockCountMap = new Map<string, { count: number; units: number; name: string }>();
    for (const r of periodRestocks) {
      const prod = products.find((p) => p.id === r.product_id);
      const name = prod ? prod.name : 'Unknown Product';
      const item = restockCountMap.get(r.product_id) || { count: 0, units: 0, name };
      item.count += 1;
      item.units += r.quantity;
      restockCountMap.set(r.product_id, item);
    }

    const frequentRestocks = Array.from(restockCountMap.entries())
      .map(([id, data]) => ({
        product_id: id,
        product_name: data.name,
        count: data.count,
        units: data.units,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Prediction summary
    let ruleBasedCount = 0;
    let mlCount = 0;
    let insufficientDataCount = 0;

    for (const p of products) {
      if (p.prediction_method === 'RANDOM_FOREST' || p.prediction_method === 'LINEAR_REGRESSION') {
        mlCount++;
      } else if (p.prediction_method === 'RULE_BASED') {
        ruleBasedCount++;
      } else {
        insufficientDataCount++;
      }
    }

    // Generate actionable business recommendations
    const recommendations: string[] = [];

    const criticalReorders = products.filter(
      (p) => p.current_stock <= (p.reorder_point ?? p.reorder_level)
    );

    if (criticalReorders.length > 0) {
      const urgentList = criticalReorders
        .slice(0, 3)
        .map((p) => `"${p.name}" (stock: ${p.current_stock}, order: ${p.recommended_reorder_quantity || 20} units)`)
        .join(', ');
      recommendations.push(
        `Critical Replenishment: ${criticalReorders.length} product(s) fell below reorder point: ${urgentList}. Immediate vendor purchase order advised.`
      );
    }

    const outOfStockItems = products.filter((p) => p.current_stock <= 0);
    if (outOfStockItems.length > 0) {
      recommendations.push(
        `Stockout Alert: ${outOfStockItems.length} product(s) are completely out of stock (${outOfStockItems.map((p) => p.name).join(', ')}), causing missed sales.`
      );
    }

    const lowDataItems = products.filter((p) => p.prediction_method === 'RULE_BASED');
    if (lowDataItems.length > 0) {
      recommendations.push(
        `Data Accumulation: ${lowDataItems.length} products are currently utilizing the Rule-Based baseline. Continue logging daily sales to meet the 90-day threshold for automated Machine Learning activation.`
      );
    }

    if (topSellingProducts.length > 0) {
      recommendations.push(
        `Fast-Mover Priority: "${topSellingProducts[0].product_name}" generated the highest revenue (₦${topSellingProducts[0].revenue.toLocaleString()}) this week. Maintain buffer stock to withstand supplier lead-time fluctuations.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('All inventory levels and prediction workflows are operating within healthy target parameters.');
    }

    return {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      business_id: businessId,
      period_start: startStr,
      period_end: endStr,
      inventory_summary: {
        total_products: products.length,
        healthy_stock: healthyCount,
        low_stock: lowStockCount,
        reorder_required: reorderCount,
        out_of_stock: outOfStockCount,
        total_inventory_value: totalInventoryValue,
      },
      sales_summary: {
        total_sales_amount: totalSalesAmount,
        total_transactions: totalTransactions,
        total_units_sold: totalUnitsSold,
        top_selling_products: topSellingProducts,
      },
      restocking_summary: {
        total_restocked_units: totalRestockedUnits,
        total_restocking_cost: totalRestockingCost,
        frequent_restocks: frequentRestocks,
      },
      prediction_summary: {
        rule_based_count: ruleBasedCount,
        ml_count: mlCount,
        insufficient_data_count: insufficientDataCount,
      },
      recommendations,
      created_at: new Date().toISOString(),
    };
  }
}
