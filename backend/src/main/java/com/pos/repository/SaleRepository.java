package com.pos.repository;

import com.pos.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime from, LocalDateTime to);

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.createdAt >= :from AND s.createdAt <= :to AND s.status = 'COMPLETED'")
    long countCompletedSalesBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.createdAt >= :from AND s.createdAt <= :to AND s.status = 'COMPLETED'")
    BigDecimal sumTotalBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.total - s.taxAmount), 0) FROM Sale s WHERE s.createdAt >= :from AND s.createdAt <= :to AND s.status = 'COMPLETED'")
    BigDecimal sumSubtotalBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT s.createdAt, SUM(s.total) FROM Sale s WHERE s.createdAt >= :from AND s.status = 'COMPLETED' GROUP BY DATE(s.createdAt) ORDER BY DATE(s.createdAt)")
    List<Object[]> getDailySalesSince(@Param("from") LocalDateTime from);

    @Query("SELECT si.product.id, si.productName, SUM(si.quantity), SUM(si.subtotal) FROM SaleItem si " +
            "JOIN si.sale s WHERE s.createdAt >= :from AND s.createdAt <= :to AND s.status = 'COMPLETED' " +
            "GROUP BY si.product.id, si.productName ORDER BY SUM(si.quantity) DESC")
    List<Object[]> getTopProductsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT s.paymentMethod, COUNT(s), SUM(s.total) FROM Sale s WHERE s.createdAt >= :from AND s.createdAt <= :to AND s.status = 'COMPLETED' GROUP BY s.paymentMethod")
    List<Object[]> getPaymentMethodStatsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.createdAt >= :from AND s.createdAt <= :to AND s.status = 'COMPLETED'")
    long countByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(s.invoiceNumber, LENGTH(s.invoiceNumber) - 3, 4) AS int)), 0) FROM Sale s WHERE s.invoiceNumber LIKE :prefix%")
    Integer findMaxSequenceForPrefix(@Param("prefix") String prefix);

    @Modifying
    @Transactional
    @Query("UPDATE Sale s SET s.createdAt = :createdAt WHERE s.id = :id")
    void updateCreatedAt(@Param("id") Long id, @Param("createdAt") LocalDateTime createdAt);
}
