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
import java.util.HashMap;
import java.time.LocalDate;

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

    // Get monthly report
    @GetMapping("/monthly-report")
    public MonthlyReport getMonthlyReport(@RequestParam String email, @RequestParam int year, @RequestParam int month) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return new MonthlyReport();
        }

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Expense> expenses = expenseRepository.findByUser(userOptional.get()).stream()
                .filter(e -> !e.getDate().isBefore(start) && !e.getDate().isAfter(end))
                .toList();

        double total = expenses.stream().mapToDouble(e -> e.getAmount()).sum();
        Map<String, Double> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getCategory, Collectors.summingDouble(Expense::getAmount)));

        return new MonthlyReport(total, categoryTotals, expenses.size());
    }

    // Get yearly report
    @GetMapping("/yearly-report")
    public YearlyReport getYearlyReport(@RequestParam String email, @RequestParam int year) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return new YearlyReport();
        }

        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        List<Expense> expenses = expenseRepository.findByUser(userOptional.get()).stream()
                .filter(e -> !e.getDate().isBefore(start) && !e.getDate().isAfter(end))
                .toList();

        double total = expenses.stream().mapToDouble(e -> e.getAmount()).sum();
        Map<Integer, Double> monthlyTotals = new HashMap<>();
        for (int m = 1; m <= 12; m++) {
            LocalDate monthStart = LocalDate.of(year, m, 1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
            double monthTotal = expenses.stream()
                    .filter(e -> !e.getDate().isBefore(monthStart) && !e.getDate().isAfter(monthEnd))
                    .mapToDouble(e -> e.getAmount()).sum();
            monthlyTotals.put(m, monthTotal);
        }

        return new YearlyReport(total, monthlyTotals, expenses.size());
    }

    public static class MonthlyReport {
        public double total;
        public Map<String, Double> categoryTotals;
        public int expenseCount;

        public MonthlyReport() {}
        public MonthlyReport(double total, Map<String, Double> categoryTotals, int expenseCount) {
            this.total = total;
            this.categoryTotals = categoryTotals;
            this.expenseCount = expenseCount;
        }
    }

    public static class YearlyReport {
        public double total;
        public Map<Integer, Double> monthlyTotals;
        public int expenseCount;

        public YearlyReport() {}
        public YearlyReport(double total, Map<Integer, Double> monthlyTotals, int expenseCount) {
            this.total = total;
            this.monthlyTotals = monthlyTotals;
            this.expenseCount = expenseCount;
        }
    }
}
