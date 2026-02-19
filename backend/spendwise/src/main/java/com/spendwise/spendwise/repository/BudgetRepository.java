package com.spendwise.spendwise.repository;

import com.spendwise.spendwise.entity.Budget;
import com.spendwise.spendwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUser(User user);

    List<Budget> findByUserAndCategory(User user, String category);

    List<Budget> findByUserAndPeriod(User user, String period);

    List<Budget> findByUserAndStartDateLessThanEqualAndEndDateGreaterThanEqual(User user, LocalDate date1, LocalDate date2);
}