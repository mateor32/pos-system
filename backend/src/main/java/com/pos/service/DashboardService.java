package com.pos.service;

import com.pos.repository.ExpenseRepository;
import com.pos.repository.ProductRepository;
import com.pos.repository.SaleRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final ProductRepository productRepository;

    public Map<String, Object> getStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime weekStart = LocalDate.now().minusDays(6).atStartOfDay();

        BigDecimal salesToday = saleRepository.sumTotalBetween(todayStart, todayEnd);
        long countToday = saleRepository.countCompletedSalesBetween(todayStart, todayEnd);
        BigDecimal subtotalToday = saleRepository.sumSubtotalBetween(todayStart, todayEnd);
        BigDecimal expensesToday = expenseRepository.sumAmountBetween(todayStart, todayEnd);
        BigDecimal profitToday = subtotalToday.subtract(expensesToday);

        BigDecimal avgTicket = countToday > 0
                ? salesToday.divide(BigDecimal.valueOf(countToday), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Last 7 days chart
        List<Map<String, Object>> last7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(23, 59, 59);
            BigDecimal dayTotal = saleRepository.sumTotalBetween(dayStart, dayEnd);
            Map<String, Object> day = new HashMap<>();
            day.put("date", date.format(DateTimeFormatter.ofPattern("dd/MM")));
            day.put("total", dayTotal);
            last7Days.add(day);
        }

        // Top 5 products today
        List<Object[]> topProductsRaw = saleRepository.getTopProductsBetween(todayStart, todayEnd);
        List<Map<String, Object>> topProducts = new ArrayList<>();
        int limit = Math.min(5, topProductsRaw.size());
        for (int i = 0; i < limit; i++) {
            Object[] row = topProductsRaw.get(i);
            Map<String, Object> prod = new HashMap<>();
            prod.put("productId", row[0]);
            prod.put("productName", row[1]);
            prod.put("quantitySold", row[2]);
            prod.put("totalRevenue", row[3]);
            topProducts.add(prod);
        }

        // Payment method distribution today
        List<Object[]> paymentStatsRaw = saleRepository.getPaymentMethodStatsBetween(todayStart, todayEnd);
        List<Map<String, Object>> paymentStats = new ArrayList<>();
        for (Object[] row : paymentStatsRaw) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("method", row[0].toString());
            stat.put("count", row[1]);
            stat.put("total", row[2]);
            paymentStats.add(stat);
        }

        // Low stock count
        long lowStockCount = productRepository.findLowStockProducts().size();

        Map<String, Object> result = new HashMap<>();
        result.put("salesToday", salesToday);
        result.put("transactionsToday", countToday);
        result.put("avgTicket", avgTicket);
        result.put("profitToday", profitToday);
        result.put("last7Days", last7Days);
        result.put("topProducts", topProducts);
        result.put("paymentStats", paymentStats);
        result.put("lowStockCount", lowStockCount);

        return result;
    }

    public Map<String, Object> getCashFlow() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(23, 59, 59);

        BigDecimal income = saleRepository.sumTotalBetween(todayStart, todayEnd);
        BigDecimal expenses = expenseRepository.sumAmountBetween(todayStart, todayEnd);
        BigDecimal balance = income.subtract(expenses);

        Map<String, Object> result = new HashMap<>();
        result.put("income", income);
        result.put("expenses", expenses);
        result.put("balance", balance);
        result.put("date", LocalDate.now().toString());

        return result;
    }
}
