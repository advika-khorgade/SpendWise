package com.spendwise.spendwise.controller;

import com.spendwise.spendwise.entity.User;
import com.spendwise.spendwise.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "User already exists";
        }

        userRepository.save(user);
        return "User registered successfully";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {

        return userRepository.findByEmail(user.getEmail())
                .filter(u -> u.getPassword().equals(user.getPassword()))
                .map(u -> "Login successful")
                .orElse("Invalid credentials");
    }
}
