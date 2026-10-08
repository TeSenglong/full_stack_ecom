package com.example.backend.service;

import com.example.backend.exception.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

final class PageRequestFactory {

    private static final int MAX_PAGE_SIZE = 100;

    private PageRequestFactory() {
    }

    static PageRequest create(int page, int size, Sort sort) {
        if (page < 0) {
            throw new BadRequestException("page must be zero or greater");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("size must be between 1 and " + MAX_PAGE_SIZE);
        }
        return PageRequest.of(page, size, sort);
    }
}
