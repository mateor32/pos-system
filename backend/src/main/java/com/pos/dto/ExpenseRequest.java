package com.pos.dto;

import com.pos.entity.Expense;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseRequest {
    private String description;
    private BigDecimal amount;
    private Expense.Category category;
    private String notes;
}
