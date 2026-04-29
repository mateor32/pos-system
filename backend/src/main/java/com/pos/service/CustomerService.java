package com.pos.service;

import com.pos.dto.CustomerRequest;
import com.pos.entity.Customer;
import com.pos.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAll() {
        return customerRepository.findByActiveTrue();
    }

    public List<Customer> search(String name) {
        return customerRepository.searchByName(name);
    }

    public Customer getById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
    }

    @Transactional
    public Customer create(CustomerRequest request) {
        return customerRepository.save(Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .taxId(request.getTaxId())
                .creditBalance(request.getCreditBalance() != null ? request.getCreditBalance() : BigDecimal.ZERO)
                .active(true)
                .build());
    }

    @Transactional
    public Customer update(Long id, CustomerRequest request) {
        Customer customer = getById(id);
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setTaxId(request.getTaxId());
        if (request.getCreditBalance() != null)
            customer.setCreditBalance(request.getCreditBalance());
        if (request.getActive() != null)
            customer.setActive(request.getActive());
        return customerRepository.save(customer);
    }

    @Transactional
    public void delete(Long id) {
        Customer customer = getById(id);
        customer.setActive(false);
        customerRepository.save(customer);
    }
}
