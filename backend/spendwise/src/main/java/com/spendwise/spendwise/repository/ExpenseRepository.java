package com.spendwise.spendwise.repository;

import com.spendwise.spendwise.entity.Expense;
import com.spendwise.spendwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND (:category IS NULL OR e.category = :category) AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndCategoryAndDateRange(@Param("user") User user, @Param("category") String category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
