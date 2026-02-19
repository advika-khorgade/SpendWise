package com.spendwise.spendwise.controller;

import com.spendwise.spendwise.entity.Budget;
import com.spendwise.spendwise.entity.User;
import com.spendwise.spendwise.repository.BudgetRepository;
import com.spendwise.spendwise.repository.ExpenseRepository;
import com.spendwise.spendwise.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetController(BudgetRepository budgetRepository, UserRepository userRepository, ExpenseRepository expenseRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
    }

    // Get all budgets for a user
    @GetMapping
    public List<Budget> getBudgets(@RequestParam String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return List.of();
        }
        return budgetRepository.findByUser(userOptional.get());
    }

    // Create a new budget
    @PostMapping
    public Budget createBudget(@RequestParam String email,
                               @RequestParam(required = false) String category,
                               @RequestParam BigDecimal amount,
                               @RequestParam String period,
                               @RequestParam LocalDate startDate,
                               @RequestParam LocalDate endDate) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Budget budget = new Budget(userOptional.get(), category, amount, period, startDate, endDate);
        return budgetRepository.save(budget);
    }

    // Update a budget
    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Long id,
                               @RequestParam BigDecimal amount,
                               @RequestParam LocalDate startDate,
                               @RequestParam LocalDate endDate) {
        Optional<Budget> budgetOptional = budgetRepository.findById(id);
        if (budgetOptional.isEmpty()) {
            throw new RuntimeException("Budget not found");
        }

        Budget budget = budgetOptional.get();
        budget.setAmount(amount);
        budget.setStartDate(startDate);
        budget.setEndDate(endDate);
        return budgetRepository.save(budget);
    }

    // Delete a budget
    @DeleteMapping("/{id}")
    public void deleteBudget(@PathVariable Long id) {
        budgetRepository.deleteById(id);
    }

    // Get budget status (spent vs budget)
    @GetMapping("/status")
    public List<BudgetStatus> getBudgetStatus(@RequestParam String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return List.of();
        }

        List<Budget> budgets = budgetRepository.findByUser(userOptional.get());
        return budgets.stream().map(budget -> {
            // Calculate spent amount for the budget period and category
            BigDecimal spent = calculateSpent(userOptional.get(), budget.getCategory(), budget.getStartDate(), budget.getEndDate());
            return new BudgetStatus(budget, spent);
        }).toList();
    }

    private BigDecimal calculateSpent(User user, String category, LocalDate start, LocalDate end) {
        BigDecimal spent = expenseRepository.sumAmountByUserAndCategoryAndDateRange(user, category, start, end);
        return spent != null ? spent : BigDecimal.ZERO;
    }

    public static class BudgetStatus {
        public Budget budget;
        public BigDecimal spent;
        public BigDecimal remaining;
        public double percentage;

        public BudgetStatus(Budget budget, BigDecimal spent) {
            this.budget = budget;
            this.spent = spent;
            this.remaining = budget.getAmount().subtract(spent);
            this.percentage = spent.divide(budget.getAmount(), 2, RoundingMode.HALF_UP).doubleValue() * 100;
        }
    }
}