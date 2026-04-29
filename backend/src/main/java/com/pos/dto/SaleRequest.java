package com.pos.dto;

import com.pos.entity.Sale;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {
    private Long customerId;
    private BigDecimal discount;
    private BigDecimal taxRate;
    private Sale.PaymentMethod paymentMethod;
    private BigDecimal amountPaid;
    private String notes;
    private List<SaleItemRequest> items;

    @Data
    public static class SaleItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal discount;
    }
}
