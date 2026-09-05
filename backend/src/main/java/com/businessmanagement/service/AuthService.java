package com.businessmanagement.service;

import com.businessmanagement.dto.LoginRequest;
import com.businessmanagement.dto.LoginResponse;
import com.businessmanagement.dto.UserResponse;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.User;
import com.businessmanagement.mapper.UserMapper;
import com.businessmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow();

            auditLogService.log(
                    AuditAction.LOGIN_SUCCESS,
                    "User",
                    user.getId(),
                    "Successful login for " + user.getEmail(),
                    user.getEmail()
            );

            return new LoginResponse(token, userMapper.toResponse(user));
        } catch (AuthenticationException ex) {
            auditLogService.log(
                    AuditAction.LOGIN_FAILURE,
                    "User",
                    null,
                    "Failed login attempt for " + request.getEmail(),
                    request.getEmail()
            );
            throw ex;
        }
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow();
        return userMapper.toResponse(user);
    }
}
