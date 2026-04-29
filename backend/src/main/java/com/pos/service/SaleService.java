package com.pos.service;

import com.pos.dto.SaleRequest;
import com.pos.dto.SaleResponse;
import com.pos.entity.*;
import com.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional
    public SaleResponse createSale(SaleRequest request) {
        User currentUser = getCurrentUser();

        // Validate and reserve stock
        List<SaleItem> items = new ArrayList<>();
        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));
            if (!product.isActive())
                throw new RuntimeException("Product is inactive: " + product.getName());
            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName() +
                        " (available: " + product.getStock() + ")");
            }

            BigDecimal itemDiscount = itemReq.getDiscount() != null ? itemReq.getDiscount() : BigDecimal.ZERO;
            BigDecimal itemSubtotal = product.getSalePrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .subtract(itemDiscount)
                    .setScale(2, RoundingMode.HALF_UP);

            SaleItem saleItem = SaleItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getSalePrice())
                    .discount(itemDiscount)
                    .subtotal(itemSubtotal)
                    .build();
            items.add(saleItem);
        }

        BigDecimal subtotal = items.stream()
                .map(SaleItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxableAmount = subtotal.subtract(discount);
        BigDecimal taxAmount = taxableAmount.multiply(taxRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = taxableAmount.add(taxAmount);
        BigDecimal amountPaid = request.getAmountPaid() != null ? request.getAmountPaid() : total;
        BigDecimal change = amountPaid.subtract(total).max(BigDecimal.ZERO);

        String invoiceNumber = generateInvoiceNumber();

        Sale sale = Sale.builder()
                .invoiceNumber(invoiceNumber)
                .user(currentUser)
                .subtotal(subtotal)
                .discount(discount)
                .taxRate(taxRate)
                .taxAmount(taxAmount)
                .total(total)
                .paymentMethod(request.getPaymentMethod())
                .amountPaid(amountPaid)
                .change(change)
                .status(Sale.Status.COMPLETED)
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        if (request.getCustomerId() != null) {
            sale.setCustomer(customerRepository.findById(request.getCustomerId()).orElse(null));
        }

        for (SaleItem item : items) {
            item.setSale(sale);
            sale.getItems().add(item);
        }

        Sale savedSale = saleRepository.save(sale);

        // Deduct stock and create movements
        for (SaleItem item : savedSale.getItems()) {
            Product product = item.getProduct();
            int previousStock = product.getStock();
            int newStock = previousStock - item.getQuantity();
            product.setStock(newStock);
            productRepository.save(product);

            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .type(StockMovement.MovementType.SALE)
                    .quantity(item.getQuantity())
                    .previousStock(previousStock)
                    .newStock(newStock)
                    .reason("Venta " + invoiceNumber)
                    .user(currentUser)
                    .build();
            stockMovementRepository.save(movement);
        }

        return toResponse(savedSale);
    }

    public List<SaleResponse> getSales(LocalDateTime from, LocalDateTime to) {
        return saleRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SaleResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public SaleResponse cancelSale(Long id) {
        Sale sale = findById(id);
        if (sale.getStatus() == Sale.Status.CANCELLED) {
            throw new RuntimeException("Sale already cancelled");
        }

        sale.setStatus(Sale.Status.CANCELLED);
        User currentUser = getCurrentUser();

        // Restore stock
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                int previousStock = product.getStock();
                int newStock = previousStock + item.getQuantity();
                product.setStock(newStock);
                productRepository.save(product);

                StockMovement movement = StockMovement.builder()
                        .product(product)
                        .type(StockMovement.MovementType.RETURN)
                        .quantity(item.getQuantity())
                        .previousStock(previousStock)
                        .newStock(newStock)
                        .reason("Cancelación " + sale.getInvoiceNumber())
                        .user(currentUser)
                        .build();
                stockMovementRepository.save(movement);
            }
        }

        return toResponse(saleRepository.save(sale));
    }

    private String generateInvoiceNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "INV-" + dateStr + "-";
        Integer maxSeq = saleRepository.findMaxSequenceForPrefix(prefix);
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%04d", nextSeq);
    }

    private Sale findById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found: " + id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public SaleResponse toResponse(Sale sale) {
        List<SaleResponse.SaleItemResponse> itemResponses = sale.getItems().stream()
                .map(item -> SaleResponse.SaleItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .discount(item.getDiscount())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return SaleResponse.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
                .customerId(sale.getCustomer() != null ? sale.getCustomer().getId() : null)
                .customerName(sale.getCustomer() != null ? sale.getCustomer().getName() : null)
                .userId(sale.getUser() != null ? sale.getUser().getId() : null)
                .userName(sale.getUser() != null ? sale.getUser().getFullName() : null)
                .subtotal(sale.getSubtotal())
                .discount(sale.getDiscount())
                .taxRate(sale.getTaxRate())
                .taxAmount(sale.getTaxAmount())
                .total(sale.getTotal())
                .paymentMethod(sale.getPaymentMethod())
                .amountPaid(sale.getAmountPaid())
                .change(sale.getChange())
                .status(sale.getStatus())
                .notes(sale.getNotes())
                .items(itemResponses)
                .createdAt(sale.getCreatedAt())
                .build();
    }
}
