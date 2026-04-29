package com.pos.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
public class CategoryRequest {
    private String name;
    private String color;
    private String icon;
}
