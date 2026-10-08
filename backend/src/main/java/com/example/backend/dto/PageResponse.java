package com.example.backend.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

public record PageResponse<T>(
        int page,
        List<T> content,
        int size,
        long totalContents,
        int totalPages,
        boolean first,
        boolean last
) {

    public static <S, T> PageResponse<T> from(
            Page<S> source,
            Function<S, T> mapper
    ) {
        Page<T> mapped = source.map(mapper);
        return new PageResponse<>(
                mapped.getNumber(),
                List.copyOf(mapped.getContent()),
                mapped.getSize(),
                mapped.getTotalElements(),
                mapped.getTotalPages(),
                mapped.isFirst(),
                mapped.isLast()
        );
    }
}
