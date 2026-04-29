package com.pos.service;

import com.pos.dto.ProductRequest;
import com.pos.dto.ProductResponse;
import com.pos.dto.StockAdjustRequest;
import com.pos.entity.Category;
import com.pos.entity.Product;
import com.pos.entity.StockMovement;
import com.pos.entity.User;
import com.pos.repository.CategoryRepository;
import com.pos.repository.ProductRepository;
import com.pos.repository.StockMovementRepository;
import com.pos.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService - Pruebas unitarias")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProductService productService;

    private Product producto;
    private Category categoria;

    @BeforeEach
    void setUp() {
        categoria = Category.builder()
                .id(1L).name("Bebidas").color("#6366f1").icon("🥤").build();

        producto = Product.builder()
                .id(1L)
                .name("Agua 500ml")
                .barcode("7702098001")
                .costPrice(new BigDecimal("800"))
                .salePrice(new BigDecimal("1500"))
                .stock(100)
                .minStock(10)
                .active(true)
                .category(categoria)
                .build();
    }

    // ─── LISTAR ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllActive retorna lista de productos activos")
    void getAllActive_retorna_productos_activos() {
        when(productRepository.findByActiveTrue()).thenReturn(List.of(producto));

        List<ProductResponse> result = productService.getAllActive();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Agua 500ml");
        assertThat(result.get(0).getStock()).isEqualTo(100);
    }

    @Test
    @DisplayName("search retorna productos que coinciden con el término")
    void search_retorna_productos_coincidentes() {
        when(productRepository.searchByNameOrBarcode("agua")).thenReturn(List.of(producto));

        List<ProductResponse> result = productService.search("agua");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getBarcode()).isEqualTo("7702098001");
    }

    @Test
    @DisplayName("getLowStock retorna productos con stock bajo")
    void getLowStock_retorna_productos_con_poco_stock() {
        Product productoLowStock = Product.builder()
                .id(2L).name("Galletas").stock(2).minStock(5).active(true)
                .costPrice(BigDecimal.ONE).salePrice(BigDecimal.TEN).build();

        when(productRepository.findLowStockProducts()).thenReturn(List.of(productoLowStock));

        List<ProductResponse> result = productService.getLowStock();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStock()).isLessThan(result.get(0).getMinStock());
    }

    // ─── CREAR ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create guarda y retorna el nuevo producto")
    void create_producto_nuevo_exitoso() {
        ProductRequest request = new ProductRequest();
        request.setName("Jugo de Naranja");
        request.setBarcode("770209802");
        request.setCostPrice(new BigDecimal("1000"));
        request.setSalePrice(new BigDecimal("2000"));
        request.setStock(50);
        request.setMinStock(5);
        request.setCategoryId(1L);

        when(productRepository.existsByBarcode("770209802")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        ProductResponse result = productService.create(request);

        assertThat(result.getName()).isEqualTo("Jugo de Naranja");
        assertThat(result.getCategoryName()).isEqualTo("Bebidas");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("create con código de barras duplicado lanza excepción")
    void create_barcode_duplicado_lanza_excepcion() {
        ProductRequest request = new ProductRequest();
        request.setName("Otro producto");
        request.setBarcode("7702098001");
        request.setCostPrice(BigDecimal.ONE);
        request.setSalePrice(BigDecimal.TEN);

        when(productRepository.existsByBarcode("7702098001")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Barcode already exists");

        verify(productRepository, never()).save(any());
    }

    // ─── AJUSTE DE STOCK ─────────────────────────────────────────────────────

    @Test
    @DisplayName("adjustStock tipo IN incrementa el stock correctamente")
    void adjustStock_IN_incrementa_stock() {
        StockAdjustRequest req = new StockAdjustRequest();
        req.setQuantity(20);
        req.setType("IN");
        req.setReason("Compra de mercancía");

        when(productRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn("admin");
        SecurityContextHolder.setContext(ctx);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(
                User.builder().id(1L).username("admin").role(User.Role.ADMIN).build()));

        ProductResponse result = productService.adjustStock(1L, req);

        assertThat(result.getStock()).isEqualTo(120); // 100 + 20
        verify(stockMovementRepository).save(argThat(m -> m.getType() == StockMovement.MovementType.IN &&
                m.getPreviousStock() == 100 &&
                m.getNewStock() == 120));
    }

    @Test
    @DisplayName("adjustStock tipo OUT con stock suficiente descuenta correctamente")
    void adjustStock_OUT_descuenta_stock() {
        StockAdjustRequest req = new StockAdjustRequest();
        req.setQuantity(30);
        req.setType("OUT");
        req.setReason("Ajuste manual");

        when(productRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn("admin");
        SecurityContextHolder.setContext(ctx);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.empty());

        ProductResponse result = productService.adjustStock(1L, req);

        assertThat(result.getStock()).isEqualTo(70); // 100 - 30
    }

    @Test
    @DisplayName("adjustStock OUT con stock insuficiente lanza excepción")
    void adjustStock_OUT_stock_insuficiente_lanza_excepcion() {
        StockAdjustRequest req = new StockAdjustRequest();
        req.setQuantity(200); // más que el stock actual (100)
        req.setType("OUT");
        req.setReason("Ajuste");

        when(productRepository.findById(1L)).thenReturn(Optional.of(producto));

        assertThatThrownBy(() -> productService.adjustStock(1L, req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Insufficient stock");
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete hace soft delete (active=false)")
    void delete_hace_soft_delete() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.delete(1L);

        assertThat(producto.isActive()).isFalse();
        verify(productRepository).save(producto);
    }

    @Test
    @DisplayName("getById con ID inexistente lanza excepción")
    void getById_inexistente_lanza_excepcion() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Product not found");
    }
}
