package com.spendwise.spendwise.repository;

import com.spendwise.spendwise.entity.Expense;
import com.spendwise.spendwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);
}
