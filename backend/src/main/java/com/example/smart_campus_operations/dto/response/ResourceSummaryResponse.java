package com.example.smart_campus_operations.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResourceSummaryResponse {
    private Long id;
    private String name;
    private String type;
    private String location;
}