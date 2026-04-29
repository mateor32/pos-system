package com.pos.service;

import com.pos.dto.CustomerRequest;
import com.pos.entity.Customer;
import com.pos.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerService - Pruebas unitarias")
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer cliente;

    @BeforeEach
    void setUp() {
        cliente = Customer.builder()
                .id(1L)
                .name("Juan García")
                .email("juan@example.com")
                .phone("3001234567")
                .address("Calle 10 # 20-30")
                .taxId("900123456-7")
                .creditBalance(BigDecimal.ZERO)
                .active(true)
                .build();
    }

    // ─── LISTAR ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAll retorna lista de clientes activos")
    void getAll_retorna_clientes_activos() {
        when(customerRepository.findByActiveTrue()).thenReturn(List.of(cliente));

        List<Customer> result = customerService.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Juan García");
        assertThat(result.get(0).isActive()).isTrue();
    }

    @Test
    @DisplayName("getAll retorna lista vacía cuando no hay clientes activos")
    void getAll_retorna_lista_vacia_si_no_hay_clientes() {
        when(customerRepository.findByActiveTrue()).thenReturn(List.of());

        List<Customer> result = customerService.getAll();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("search retorna clientes que coinciden con el nombre")
    void search_retorna_clientes_por_nombre() {
        when(customerRepository.searchByName("juan")).thenReturn(List.of(cliente));

        List<Customer> result = customerService.search("juan");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).containsIgnoringCase("juan");
    }

    // ─── OBTENER POR ID ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getById retorna cliente existente")
    void getById_retorna_cliente_existente() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(cliente));

        Customer result = customerService.getById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("juan@example.com");
    }

    @Test
    @DisplayName("getById con ID inexistente lanza excepción")
    void getById_inexistente_lanza_excepcion() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Customer not found");
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create guarda y retorna nuevo cliente")
    void create_nuevo_cliente_exitoso() {
        CustomerRequest request = new CustomerRequest();
        request.setName("María López");
        request.setEmail("maria@example.com");
        request.setPhone("3109876543");
        request.setAddress("Carrera 5 # 10-15");
        request.setTaxId("800987654-3");
        request.setCreditBalance(new BigDecimal("50000"));

        Customer clienteGuardado = Customer.builder()
                .id(2L).name("María López").email("maria@example.com")
                .phone("3109876543").creditBalance(new BigDecimal("50000"))
                .active(true).build();

        when(customerRepository.save(any(Customer.class))).thenReturn(clienteGuardado);

        Customer result = customerService.create(request);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getName()).isEqualTo("María López");
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    @DisplayName("create sin creditBalance asigna ZERO por defecto")
    void create_sin_creditBalance_asigna_zero() {
        CustomerRequest request = new CustomerRequest();
        request.setName("Cliente Sin Crédito");
        request.setCreditBalance(null);

        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        Customer result = customerService.create(request);

        assertThat(result.getCreditBalance()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    // ─── ACTUALIZAR ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("update modifica los campos del cliente")
    void update_modifica_campos_cliente() {
        CustomerRequest request = new CustomerRequest();
        request.setName("Juan García Actualizado");
        request.setEmail("juan.nuevo@example.com");
        request.setPhone("3201112233");
        request.setAddress("Nueva Dirección");
        request.setTaxId("900123456-7");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        Customer result = customerService.update(1L, request);

        assertThat(result.getName()).isEqualTo("Juan García Actualizado");
        assertThat(result.getEmail()).isEqualTo("juan.nuevo@example.com");
        assertThat(result.getPhone()).isEqualTo("3201112233");
        verify(customerRepository).save(cliente);
    }

    @Test
    @DisplayName("update de cliente inexistente lanza excepción")
    void update_cliente_inexistente_lanza_excepcion() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.update(99L, new CustomerRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Customer not found");
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete hace soft delete (active=false)")
    void delete_hace_soft_delete() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(customerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        customerService.delete(1L);

        assertThat(cliente.isActive()).isFalse();
        verify(customerRepository).save(cliente);
    }

    @Test
    @DisplayName("delete de cliente inexistente lanza excepción")
    void delete_cliente_inexistente_lanza_excepcion() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.delete(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Customer not found");
    }
}
