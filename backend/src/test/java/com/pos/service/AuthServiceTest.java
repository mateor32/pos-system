package com.pos.service;

import com.pos.config.JwtUtil;
import com.pos.dto.AuthResponse;
import com.pos.dto.LoginRequest;
import com.pos.dto.RegisterRequest;
import com.pos.entity.User;
import com.pos.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Pruebas unitarias")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthService authService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .username("admin")
                .password("hashed_password")
                .fullName("Administrador")
                .email("admin@pos.com")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
    }

    // ─── LOGIN ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Login exitoso devuelve AuthResponse con token")
    void login_exitoso_devuelve_token() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("admin123");

        UserDetails userDetails = mock(UserDetails.class);

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(userDetailsService.loadUserByUsername("admin")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("jwt.token.aqui");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt.token.aqui");
        assertThat(response.getUsername()).isEqualTo("admin");
        assertThat(response.getRole()).isEqualTo(User.Role.ADMIN);
        verify(userRepository).save(adminUser); // lastLogin actualizado
    }

    @Test
    @DisplayName("Login con usuario inexistente lanza excepción")
    void login_usuario_inexistente_lanza_excepcion() {
        LoginRequest request = new LoginRequest();
        request.setUsername("noexiste");
        request.setPassword("pass");

        when(userRepository.findByUsername("noexiste")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Login con credenciales incorrectas lanza BadCredentialsException")
    void login_credenciales_invalidas_lanza_excepcion() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("wrong");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    // ─── REGISTER ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Registro exitoso de nuevo usuario")
    void register_nuevo_usuario_exitoso() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("cajero2");
        request.setPassword("pass123");
        request.setFullName("Cajero Dos");
        request.setEmail("cajero2@pos.com");
        request.setRole(User.Role.CASHIER);

        UserDetails userDetails = mock(UserDetails.class);

        when(userRepository.existsByUsername("cajero2")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("hashed");
        when(userDetailsService.loadUserByUsername("cajero2")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("new.jwt.token");

        User savedUser = User.builder()
                .id(5L).username("cajero2").password("hashed")
                .fullName("Cajero Dos").email("cajero2@pos.com")
                .role(User.Role.CASHIER).active(true).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("new.jwt.token");
        assertThat(response.getUsername()).isEqualTo("cajero2");
        verify(passwordEncoder).encode("pass123");
    }

    @Test
    @DisplayName("Registro con username duplicado lanza excepción")
    void register_username_duplicado_lanza_excepcion() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("admin");
        request.setPassword("cualquier");
        request.setFullName("Otro Admin");

        when(userRepository.existsByUsername("admin")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Registro sin rol asigna CASHIER por defecto")
    void register_sin_rol_asigna_cashier_por_defecto() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("nuevo");
        request.setPassword("pass");
        request.setFullName("Nuevo");
        request.setRole(null); // sin rol

        UserDetails userDetails = mock(UserDetails.class);
        when(userRepository.existsByUsername("nuevo")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userDetailsService.loadUserByUsername("nuevo")).thenReturn(userDetails);
        when(jwtUtil.generateToken(any())).thenReturn("token");

        User savedUser = User.builder()
                .id(9L).username("nuevo").password("hashed")
                .fullName("Nuevo").role(User.Role.CASHIER).active(true).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo(User.Role.CASHIER);
    }
}
