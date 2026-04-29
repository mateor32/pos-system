package com.pos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String name;
    private String barcode;
    private String description;
    private BigDecimal costPrice;
    private BigDecimal salePrice;
    private Integer stock;
    private Integer minStock;
    private String imageUrl;
    private Boolean active;
    private Long categoryId;
}
