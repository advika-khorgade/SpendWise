package com.spendwise.spendwise.controller;

import com.spendwise.spendwise.entity.Expense;
import com.spendwise.spendwise.entity.User;
import com.spendwise.spendwise.repository.ExpenseRepository;
import com.spendwise.spendwise.repository.UserRepository;
import com.spendwise.spendwise.dto.ExpenseResponse;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseRepository expenseRepository,
                             UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    // Add expense
    @PostMapping
    public ExpenseResponse addExpense(@RequestParam String email,
                             @RequestBody Expense expense) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return new ExpenseResponse("User not found", false);
        }

        expense.setUser(userOptional.get());
        Expense savedExpense = expenseRepository.save(expense);

        return new ExpenseResponse("Expense added successfully", true, savedExpense);
    }

    // Get total expense for a user
    @GetMapping("/total")
    public Double getTotalExpense(@RequestParam String email) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return 0.0;
        }

        List<Expense> expenses = expenseRepository.findByUser(userOptional.get());

        return expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();
    }

    // Get category-wise summary
    @GetMapping("/summary")
    public Map<String, Double> getCategorySummary(@RequestParam String email) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return Map.of();
        }

        List<Expense> expenses = expenseRepository.findByUser(userOptional.get());

        return expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));
    }

    @GetMapping("/filter")
    public List<Expense> filterByDate(
            @RequestParam String email,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return List.of();
        }

        List<Expense> expenses = expenseRepository.findByUser(userOptional.get());

        return expenses.stream()
                .filter(expense -> !expense.getDate().isBefore(java.time.LocalDate.parse(startDate))
                        && !expense.getDate().isAfter(java.time.LocalDate.parse(endDate)))
                .toList();
    }

    // Get all expenses for a user
    @GetMapping
    public List<Expense> getExpenses(@RequestParam String email) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return List.of();
        }

        return expenseRepository.findByUser(userOptional.get());
    }
}
