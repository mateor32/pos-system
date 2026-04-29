package com.pos.service;

import com.pos.dto.ProductRequest;
import com.pos.dto.ProductResponse;
import com.pos.dto.StockAdjustRequest;
import com.pos.entity.Product;
import com.pos.entity.StockMovement;
import com.pos.entity.User;
import com.pos.repository.CategoryRepository;
import com.pos.repository.ProductRepository;
import com.pos.repository.StockMovementRepository;
import com.pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;

    public List<ProductResponse> getAllActive() {
        return productRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> search(String q) {
        return productRepository.searchByNameOrBarcode(q).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getLowStock() {
        return productRepository.findLowStockProducts().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (request.getBarcode() != null && productRepository.existsByBarcode(request.getBarcode())) {
            throw new RuntimeException("Barcode already exists");
        }

        Product product = Product.builder()
                .name(request.getName())
                .barcode(request.getBarcode())
                .description(request.getDescription())
                .costPrice(request.getCostPrice())
                .salePrice(request.getSalePrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .minStock(request.getMinStock() != null ? request.getMinStock() : 5)
                .imageUrl(request.getImageUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found")));
        }

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findById(id);

        product.setName(request.getName());
        if (request.getBarcode() != null && !request.getBarcode().equals(product.getBarcode())) {
            if (productRepository.existsByBarcode(request.getBarcode())) {
                throw new RuntimeException("Barcode already exists");
            }
            product.setBarcode(request.getBarcode());
        }
        product.setDescription(request.getDescription());
        product.setCostPrice(request.getCostPrice());
        product.setSalePrice(request.getSalePrice());
        product.setMinStock(request.getMinStock() != null ? request.getMinStock() : 5);
        product.setImageUrl(request.getImageUrl());
        if (request.getActive() != null)
            product.setActive(request.getActive());

        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found")));
        } else {
            product.setCategory(null);
        }

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse adjustStock(Long id, StockAdjustRequest request) {
        Product product = findById(id);
        int previousStock = product.getStock();
        int newStock;

        StockMovement.MovementType movementType;
        switch (request.getType().toUpperCase()) {
            case "IN" -> {
                newStock = previousStock + request.getQuantity();
                movementType = StockMovement.MovementType.IN;
            }
            case "OUT" -> {
                newStock = previousStock - request.getQuantity();
                movementType = StockMovement.MovementType.OUT;
            }
            default -> {
                newStock = request.getQuantity();
                movementType = StockMovement.MovementType.ADJUSTMENT;
            }
        }

        if (newStock < 0)
            throw new RuntimeException("Insufficient stock");

        product.setStock(newStock);
        productRepository.save(product);

        User currentUser = getCurrentUser();
        StockMovement movement = StockMovement.builder()
                .product(product)
                .type(movementType)
                .quantity(Math.abs(newStock - previousStock))
                .previousStock(previousStock)
                .newStock(newStock)
                .reason(request.getReason())
                .user(currentUser)
                .build();
        stockMovementRepository.save(movement);

        return toResponse(product);
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    public ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .barcode(p.getBarcode())
                .description(p.getDescription())
                .costPrice(p.getCostPrice())
                .salePrice(p.getSalePrice())
                .stock(p.getStock())
                .minStock(p.getMinStock())
                .imageUrl(p.getImageUrl())
                .active(p.isActive())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .categoryColor(p.getCategory() != null ? p.getCategory().getColor() : null)
                .categoryIcon(p.getCategory() != null ? p.getCategory().getIcon() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
