package com.pos.dto;

import lombok.Data;

@Data
public class StockAdjustRequest {
    private Integer quantity;
    private String reason;
    private String type; // IN, OUT, ADJUSTMENT
}
