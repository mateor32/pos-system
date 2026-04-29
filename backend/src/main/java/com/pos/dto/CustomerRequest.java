package com.pos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CustomerRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String taxId;
    private BigDecimal creditBalance;
    private Boolean active;
}
