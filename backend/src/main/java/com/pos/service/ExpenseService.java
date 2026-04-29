package com.pos.service;

import com.pos.dto.ExpenseRequest;
import com.pos.entity.Expense;
import com.pos.entity.User;
import com.pos.repository.ExpenseRepository;
import com.pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public List<Expense> getAll(LocalDateTime from, LocalDateTime to) {
        return expenseRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to);
    }

    @Transactional
    public Expense create(ExpenseRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);

        return expenseRepository.save(Expense.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .category(request.getCategory())
                .notes(request.getNotes())
                .user(user)
                .build());
    }

    @Transactional
    public void delete(Long id) {
        expenseRepository.deleteById(id);
    }
}
