package com.pos.config;

import com.pos.entity.*;
import com.pos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping seed data");
            return;
        }

        log.info("Initializing database with seed data...");

        // Users
        User admin = userRepository.save(User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Administrador Sistema")
                .email("admin@pos.com")
                .role(User.Role.ADMIN)
                .active(true)
                .build());

        User manager = userRepository.save(User.builder()
                .username("gerente")
                .password(passwordEncoder.encode("gerente123"))
                .fullName("Carlos Gerente")
                .email("gerente@pos.com")
                .role(User.Role.MANAGER)
                .active(true)
                .build());

        User cashier = userRepository.save(User.builder()
                .username("cajero")
                .password(passwordEncoder.encode("cajero123"))
                .fullName("Maria Cajero")
                .email("cajero@pos.com")
                .role(User.Role.CASHIER)
                .active(true)
                .build());

        // Categories
        Category catBebidas = categoryRepository.save(Category.builder()
                .name("Bebidas").color("#3b82f6").icon("🥤").build());
        Category catSnacks = categoryRepository.save(Category.builder()
                .name("Snacks").color("#f59e0b").icon("🍿").build());
        Category catLacteos = categoryRepository.save(Category.builder()
                .name("Lácteos").color("#10b981").icon("🥛").build());
        Category catAseo = categoryRepository.save(Category.builder()
                .name("Aseo").color("#8b5cf6").icon("🧼").build());
        Category catPaneria = categoryRepository.save(Category.builder()
                .name("Panadería").color("#ef4444").icon("🍞").build());

        // Products
        List<Product> products = List.of(
                productRepository.save(Product.builder().name("Agua Cristal 600ml").barcode("7702001000001")
                        .costPrice(new BigDecimal("800")).salePrice(new BigDecimal("1500"))
                        .stock(100).minStock(20).category(catBebidas).active(true).build()),
                productRepository.save(Product.builder().name("Coca-Cola 350ml").barcode("7702001000002")
                        .costPrice(new BigDecimal("1500")).salePrice(new BigDecimal("2500"))
                        .stock(60).minStock(15).category(catBebidas).active(true).build()),
                productRepository.save(Product.builder().name("Jugo Hit Mango 250ml").barcode("7702001000003")
                        .costPrice(new BigDecimal("1200")).salePrice(new BigDecimal("2000"))
                        .stock(40).minStock(10).category(catBebidas).active(true).build()),
                productRepository.save(Product.builder().name("Papas Margarita 60g").barcode("7702001000004")
                        .costPrice(new BigDecimal("1800")).salePrice(new BigDecimal("3000"))
                        .stock(50).minStock(10).category(catSnacks).active(true).build()),
                productRepository.save(Product.builder().name("Chitos Flamin 50g").barcode("7702001000005")
                        .costPrice(new BigDecimal("1600")).salePrice(new BigDecimal("2800"))
                        .stock(45).minStock(10).category(catSnacks).active(true).build()),
                productRepository.save(Product.builder().name("Chocolatina Jet 16g").barcode("7702001000006")
                        .costPrice(new BigDecimal("700")).salePrice(new BigDecimal("1200"))
                        .stock(80).minStock(20).category(catSnacks).active(true).build()),
                productRepository.save(Product.builder().name("Leche Entera Alquería 1L").barcode("7702001000007")
                        .costPrice(new BigDecimal("2800")).salePrice(new BigDecimal("4200"))
                        .stock(30).minStock(10).category(catLacteos).active(true).build()),
                productRepository.save(Product.builder().name("Yogurt Alpina Fresa 200g").barcode("7702001000008")
                        .costPrice(new BigDecimal("1400")).salePrice(new BigDecimal("2300"))
                        .stock(25).minStock(8).category(catLacteos).active(true).build()),
                productRepository.save(Product.builder().name("Queso Campesino 250g").barcode("7702001000009")
                        .costPrice(new BigDecimal("4500")).salePrice(new BigDecimal("7000"))
                        .stock(15).minStock(5).category(catLacteos).active(true).build()),
                productRepository.save(Product.builder().name("Jabón Dove 100g").barcode("7702001000010")
                        .costPrice(new BigDecimal("2200")).salePrice(new BigDecimal("3800"))
                        .stock(35).minStock(10).category(catAseo).active(true).build()),
                productRepository.save(Product.builder().name("Shampoo Head&Shoulders 200ml").barcode("7702001000011")
                        .costPrice(new BigDecimal("8000")).salePrice(new BigDecimal("13500"))
                        .stock(20).minStock(5).category(catAseo).active(true).build()),
                productRepository.save(Product.builder().name("Papel Higiénico Scott x4").barcode("7702001000012")
                        .costPrice(new BigDecimal("4500")).salePrice(new BigDecimal("7200"))
                        .stock(40).minStock(10).category(catAseo).active(true).build()),
                productRepository.save(Product.builder().name("Pan Tajado Bimbo 500g").barcode("7702001000013")
                        .costPrice(new BigDecimal("3200")).salePrice(new BigDecimal("5500"))
                        .stock(25).minStock(8).category(catPaneria).active(true).build()),
                productRepository.save(Product.builder().name("Croissant de Mantequilla").barcode("7702001000014")
                        .costPrice(new BigDecimal("1800")).salePrice(new BigDecimal("3200"))
                        .stock(3).minStock(10).category(catPaneria).active(true).build()),
                productRepository.save(Product.builder().name("Pandeyuca x6").barcode("7702001000015")
                        .costPrice(new BigDecimal("3500")).salePrice(new BigDecimal("6000"))
                        .stock(20).minStock(8).category(catPaneria).active(true).build()),
                productRepository.save(Product.builder().name("Gaseosa Postobón 1.5L").barcode("7702001000016")
                        .costPrice(new BigDecimal("2800")).salePrice(new BigDecimal("4500"))
                        .stock(35).minStock(10).category(catBebidas).active(true).build()),
                productRepository.save(Product.builder().name("Bon Bon Bum Fresa").barcode("7702001000017")
                        .costPrice(new BigDecimal("350")).salePrice(new BigDecimal("600"))
                        .stock(100).minStock(30).category(catSnacks).active(true).build()),
                productRepository.save(Product.builder().name("Crema Dental Colgate 75ml").barcode("7702001000018")
                        .costPrice(new BigDecimal("3500")).salePrice(new BigDecimal("5800"))
                        .stock(28).minStock(8).category(catAseo).active(true).build()),
                productRepository.save(Product.builder().name("Mantequilla Rama 250g").barcode("7702001000019")
                        .costPrice(new BigDecimal("3800")).salePrice(new BigDecimal("6200"))
                        .stock(22).minStock(6).category(catLacteos).active(true).build()),
                productRepository.save(Product.builder().name("Arroz Diana 1kg").barcode("7702001000020")
                        .costPrice(new BigDecimal("2500")).salePrice(new BigDecimal("4000"))
                        .stock(4).minStock(10).category(catSnacks).active(true).build()));

        // Customers
        Customer c1 = customerRepository.save(Customer.builder().name("Juan García").email("juan@email.com")
                .phone("3001234567").address("Calle 45 #12-34, Bogotá").taxId("1234567890").active(true).build());
        Customer c2 = customerRepository.save(Customer.builder().name("María López").email("maria@email.com")
                .phone("3109876543").address("Carrera 7 #69-22, Bogotá").taxId("9876543210").active(true).build());
        Customer c3 = customerRepository.save(Customer.builder().name("Carlos Martínez").email("carlos@email.com")
                .phone("3205551234").address("Av. 19 #120-50, Bogotá").taxId("5554443330").active(true).build());
        Customer c4 = customerRepository.save(Customer.builder().name("Ana Rodríguez").email("ana@email.com")
                .phone("3157778899").address("Calle 80 #35-10, Bogotá").taxId("7778889990").active(true).build());
        Customer c5 = customerRepository.save(Customer.builder().name("Pedro Gómez").email("pedro@email.com")
                .phone("3002223344").address("Carrera 15 #93-47, Bogotá").taxId("2223334440").active(true).build());

        List<Customer> customers = List.of(c1, c2, c3, c4, c5);

        // Sales for last 7 days
        Random random = new Random(42);
        Sale.PaymentMethod[] methods = Sale.PaymentMethod.values();
        int saleSeq = 1;

        for (int dayOffset = 6; dayOffset >= 0; dayOffset--) {
            LocalDateTime baseTime = LocalDateTime.now().minusDays(dayOffset);
            int salesPerDay = 1 + random.nextInt(3);

            for (int s = 0; s < salesPerDay; s++) {
                LocalDateTime saleTime = baseTime.withHour(9 + random.nextInt(10)).withMinute(random.nextInt(60));
                String dateStr = saleTime.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                String invoiceNumber = "INV-" + dateStr + "-" + String.format("%04d", saleSeq++);

                Product p1 = products.get(random.nextInt(products.size()));
                Product p2 = products.get(random.nextInt(products.size()));
                int qty1 = 1 + random.nextInt(3);
                int qty2 = 1 + random.nextInt(2);

                BigDecimal sub1 = p1.getSalePrice().multiply(BigDecimal.valueOf(qty1));
                BigDecimal sub2 = p2.getSalePrice().multiply(BigDecimal.valueOf(qty2));
                BigDecimal subtotal = sub1.add(sub2);
                BigDecimal total = subtotal;

                Sale.PaymentMethod method = methods[random.nextInt(methods.length)];

                Sale sale = Sale.builder()
                        .invoiceNumber(invoiceNumber)
                        .customer(customers.get(random.nextInt(customers.size())))
                        .user(cashier)
                        .subtotal(subtotal)
                        .discount(BigDecimal.ZERO)
                        .taxRate(BigDecimal.ZERO)
                        .taxAmount(BigDecimal.ZERO)
                        .total(total)
                        .paymentMethod(method)
                        .amountPaid(total)
                        .change(BigDecimal.ZERO)
                        .status(Sale.Status.COMPLETED)
                        .build();

                SaleItem item1 = SaleItem.builder()
                        .sale(sale).product(p1).productName(p1.getName())
                        .quantity(qty1).unitPrice(p1.getSalePrice()).discount(BigDecimal.ZERO).subtotal(sub1).build();
                SaleItem item2 = SaleItem.builder()
                        .sale(sale).product(p2).productName(p2.getName())
                        .quantity(qty2).unitPrice(p2.getSalePrice()).discount(BigDecimal.ZERO).subtotal(sub2).build();

                sale.getItems().add(item1);
                sale.getItems().add(item2);

                Sale savedSale = saleRepository.save(sale);

                // Fix createdAt for historical data
                saleRepository.updateCreatedAt(savedSale.getId(), saleTime);
            }
        }

        // Expenses
        expenseRepository.save(Expense.builder()
                .description("Arriendo local comercial")
                .amount(new BigDecimal("1500000"))
                .category(Expense.Category.RENT)
                .notes("Mes de " + java.time.Month.from(LocalDateTime.now()).name())
                .user(admin)
                .build());

        expenseRepository.save(Expense.builder()
                .description("Servicio de energía eléctrica")
                .amount(new BigDecimal("320000"))
                .category(Expense.Category.UTILITIES)
                .notes("Factura mes anterior")
                .user(admin)
                .build());

        expenseRepository.save(Expense.builder()
                .description("Compra de mercancía proveedor principal")
                .amount(new BigDecimal("2800000"))
                .category(Expense.Category.PURCHASES)
                .notes("Factura #A-2024-0456")
                .user(manager)
                .build());

        log.info("Database initialized successfully with seed data.");
    }
}
