package com.spendwise.spendwise.controller;

import com.spendwise.spendwise.entity.Expense;
import com.spendwise.spendwise.entity.User;
import com.spendwise.spendwise.repository.ExpenseRepository;
import com.spendwise.spendwise.repository.UserRepository;
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
    public String addExpense(@RequestParam String email,
                             @RequestBody Expense expense) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return "User not found";
        }

        expense.setUser(userOptional.get());
        expenseRepository.save(expense);

        return "Expense added successfully";
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

    // Delete expense
    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id) {

        if (!expenseRepository.existsById(id)) {
            return "Expense not found";
        }

        expenseRepository.deleteById(id);
        return "Expense deleted successfully";
    }

    // Update expense
    @PutMapping("/{id}")
    public String updateExpense(@PathVariable Long id,
                            @RequestBody Expense updatedExpense) {

        Optional<Expense> existingExpense = expenseRepository.findById(id);

        if (existingExpense.isEmpty()) {
            return "Expense not found";
        }

        Expense expense = existingExpense.get();

        expense.setTitle(updatedExpense.getTitle());
        expense.setAmount(updatedExpense.getAmount());
        expense.setCategory(updatedExpense.getCategory());
        expense.setDate(updatedExpense.getDate());

        expenseRepository.save(expense);

        return "Expense updated successfully";
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
}
