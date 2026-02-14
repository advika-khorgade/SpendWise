package com.spendwise.spendwise.controller;

import com.spendwise.spendwise.entity.User;
import com.spendwise.spendwise.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import com.spendwise.spendwise.dto.LoginRequest;
import com.spendwise.spendwise.dto.RegistrationRequest;
import com.spendwise.spendwise.dto.AuthResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegistrationRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse("User already exists", false);
        }

        // Create user with email as name if name not provided
        User user = new User(request.getEmail().split("@")[0], request.getEmail(), request.getPassword());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return new AuthResponse("User registered successfully", true);
    }

   /* @PostMapping("/login")
    public String login(@RequestBody User user) {

        return userRepository.findByEmail(user.getEmail())
                .filter(u -> u.getPassword().equals(user.getPassword()))
                .map(u -> "Login successful")
                .orElse("Invalid credentials");
    }*/

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            return new AuthResponse("User not found", false);
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse("Invalid password", false);
        }
        return new AuthResponse("Login successful", true);
    }

}
