package com.businessmanagement.config;

import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.entity.Notification;
import com.businessmanagement.entity.NotificationType;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.InventoryMovement;
import com.businessmanagement.entity.InventoryMovementType;
import com.businessmanagement.entity.Product;
import com.businessmanagement.entity.Role;
import com.businessmanagement.entity.User;
import com.businessmanagement.repository.AuditLogRepository;
import com.businessmanagement.repository.CustomerRepository;
import com.businessmanagement.repository.InventoryMovementRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.NotificationRepository;
import com.businessmanagement.repository.ProductRepository;
import com.businessmanagement.repository.InvoiceRepository;
import com.businessmanagement.repository.SalesOrderRepository;
import com.businessmanagement.repository.UserRepository;
import com.businessmanagement.dto.PaymentRequest;
import com.businessmanagement.dto.SalesOrderItemRequest;
import com.businessmanagement.dto.SalesOrderRequest;
import com.businessmanagement.entity.InvoiceStatus;
import com.businessmanagement.entity.PaymentMethod;
import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.entity.SalesOrderStatus;
import com.businessmanagement.service.AuditLogService;
import com.businessmanagement.service.InvoiceService;
import com.businessmanagement.service.PaymentService;
import com.businessmanagement.service.SalesOrderService;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final SalesOrderService salesOrderService;
    private final InvoiceService invoiceService;
    private final PaymentService paymentService;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedCustomers();
        seedProducts();
        normalizeInventoryVersions();
        normalizeOrderSequences();
        normalizeInvoiceSequences();
        seedOrders();
        seedInvoices();
        seedDemoAuditLogs();
        seedDemoNotifications();
    }

    private void seedUsers() {
        seedUser("admin@business.local", "Admin123!", Role.ADMIN);
        seedUser("manager@business.local", "Manager123!", Role.MANAGER);
        seedUser("staff@business.local", "Staff123!", Role.STAFF);
    }

    private void seedUser(String email, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        userRepository.save(User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .enabled(true)
                .build());
    }

    private void seedCustomers() {
        seedCustomer("Rahul Sharma", "rahul@acme.local", "+91 98765 43210", "Acme Traders", "12 MG Road, Bengaluru");
        seedCustomer("Priya Patel", "priya@northstar.local", "+91 91234 56789", "Northstar Retail", "45 Ring Road, Ahmedabad");
        seedCustomer("James Wilson", "james@globalcorp.local", "+1 415 555 0101", "Global Corp", "500 Market Street, San Francisco");
        seedCustomer("Anita Desai", "anita@desai.local", "+91 99887 76655", "Desai Enterprises", "78 FC Road, Pune");
        seedCustomer("Walk-in Customer", null, null, null, null);
    }

    private void seedCustomer(String name, String email, String phone, String company, String address) {
        if (email != null && customerRepository.existsByEmail(email)) {
            return;
        }
        if (email == null && customerRepository.existsByName(name)) {
            return;
        }

        customerRepository.save(Customer.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .company(company)
                .address(address)
                .build());
    }

    private void seedProducts() {
        seedProduct("Business Laptop", "LAP-001", "Electronics", "14-inch business laptop", "899.99", "650.00", 5, 3);
        seedProduct("Wireless Mouse", "MOU-002", "Electronics", "Ergonomic wireless mouse", "29.99", "12.00", 10, 8);
        seedProduct("Office Chair", "CHR-003", "Furniture", "Adjustable office chair", "199.99", "120.00", 3, 2);
        seedProduct("A4 Paper Ream", "PAP-004", "Stationery", "500-sheet A4 paper ream", "6.99", "4.00", 20, 45);
        seedProduct("Desk Lamp", "LMP-005", "Furniture", "LED desk lamp", "39.99", "18.00", 5, 4);
        seedProduct("USB-C Hub", "HUB-006", "Electronics", "7-in-1 USB-C hub", "49.99", "25.00", 8, 6);
        seedProduct("Whiteboard Marker Set", "MRK-007", "Stationery", "Set of 4 markers", "8.99", "3.50", 15, 12);
    }

    private void seedProduct(
            String name,
            String sku,
            String category,
            String description,
            String sellingPrice,
            String costPrice,
            int minimumStock,
            int quantity
    ) {
        if (productRepository.existsBySku(sku)) {
            return;
        }

        Product product = productRepository.save(Product.builder()
                .name(name)
                .sku(sku)
                .category(category)
                .description(description)
                .sellingPrice(new BigDecimal(sellingPrice))
                .costPrice(new BigDecimal(costPrice))
                .minimumStockLevel(minimumStock)
                .active(true)
                .build());

        inventoryRepository.save(Inventory.builder()
                .product(product)
                .quantity(quantity)
                .version(0L)
                .build());

        if (quantity > 0) {
            inventoryMovementRepository.save(InventoryMovement.builder()
                    .product(product)
                    .type(InventoryMovementType.STOCK_IN)
                    .quantity(quantity)
                    .previousQuantity(0)
                    .newQuantity(quantity)
                    .reason("Initial stock")
                    .build());
        }
    }

    private void normalizeInventoryVersions() {
        entityManager.createNativeQuery("UPDATE inventory SET version = 0 WHERE version IS NULL")
                .executeUpdate();
        entityManager.createNativeQuery("UPDATE inventory SET quantity = 0 WHERE quantity IS NULL")
                .executeUpdate();
        entityManager.createNativeQuery("UPDATE inventory SET updated_at = NOW() WHERE updated_at IS NULL")
                .executeUpdate();
    }

    private void normalizeOrderSequences() {
        entityManager.createNativeQuery("UPDATE order_sequences SET last_value = 0 WHERE last_value IS NULL")
                .executeUpdate();
    }

    private void normalizeInvoiceSequences() {
        entityManager.createNativeQuery("UPDATE invoice_sequences SET last_value = 0 WHERE last_value IS NULL")
                .executeUpdate();
        entityManager.createNativeQuery("UPDATE invoices SET version = 0 WHERE version IS NULL")
                .executeUpdate();
    }

    private void seedInvoices() {
        if (invoiceRepository.count() > 0) {
            return;
        }

        try {
            List<SalesOrder> confirmedOrders = ensureConfirmedOrdersForInvoiceSeed();
            if (confirmedOrders.size() < 3) {
                return;
            }

            var unpaid = invoiceService.generateFromOrder(confirmedOrders.get(0).getId());

            var partial = invoiceService.generateFromOrder(confirmedOrders.get(1).getId());
            BigDecimal partialAmount = partial.getTotalAmount()
                    .divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
            recordPayment(partial.getId(), partialAmount);

            var paid = invoiceService.generateFromOrder(confirmedOrders.get(2).getId());
            recordPayment(paid.getId(), paid.getTotalAmount());
        } catch (Exception ignored) {
            // Skip invoice seed when sample orders or payments cannot be created safely.
        }
    }

    private List<SalesOrder> ensureConfirmedOrdersForInvoiceSeed() {
        List<SalesOrder> confirmed = salesOrderRepository.findByStatus(SalesOrderStatus.CONFIRMED).stream()
                .filter(order -> !invoiceRepository.existsBySalesOrderId(order.getId()))
                .toList();

        if (confirmed.size() >= 3) {
            return confirmed.subList(0, 3);
        }

        Customer rahul = customerRepository.findByEmail("rahul@acme.local").orElse(null);
        Customer priya = customerRepository.findByEmail("priya@northstar.local").orElse(null);
        Customer anita = customerRepository.findByEmail("anita@desai.local").orElse(null);
        Product mouse = productRepository.findBySku("MOU-002").orElse(null);
        Product paper = productRepository.findBySku("PAP-004").orElse(null);
        Product hub = productRepository.findBySku("HUB-006").orElse(null);

        if (rahul == null || priya == null || anita == null || mouse == null || paper == null || hub == null) {
            return confirmed;
        }

        tryCreateConfirmedOrder(rahul.getId(), mouse.getId(), 1);
        tryCreateConfirmedOrder(priya.getId(), paper.getId(), 3);
        tryCreateConfirmedOrder(anita.getId(), hub.getId(), 1);

        return salesOrderRepository.findByStatus(SalesOrderStatus.CONFIRMED).stream()
                .filter(order -> !invoiceRepository.existsBySalesOrderId(order.getId()))
                .toList();
    }

    private void tryCreateConfirmedOrder(Long customerId, Long productId, int quantity) {
        SalesOrderRequest request = new SalesOrderRequest();
        request.setCustomerId(customerId);
        request.setTaxAmount(BigDecimal.ZERO);
        request.setItems(List.of(item(productId, quantity)));
        var created = salesOrderService.create(request);
        try {
            salesOrderService.confirm(created.getId());
        } catch (Exception ignored) {
            // Skip when stock is unavailable.
        }
    }

    private void recordPayment(Long invoiceId, BigDecimal amount) {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(amount);
        request.setPaymentDate(LocalDate.now());
        request.setMethod(PaymentMethod.UPI);
        request.setReferenceNumber("SEED-PAYMENT");
        try {
            paymentService.recordPayment(invoiceId, request);
        } catch (Exception ignored) {
            // Skip partial/full seed payments when totals do not match sample expectations.
        }
    }

    private void seedOrders() {
        if (salesOrderRepository.count() > 0) {
            return;
        }

        Customer rahul = customerRepository.findByEmail("rahul@acme.local").orElse(null);
        Customer priya = customerRepository.findByEmail("priya@northstar.local").orElse(null);
        Customer james = customerRepository.findByEmail("james@globalcorp.local").orElse(null);
        Product mouse = productRepository.findBySku("MOU-002").orElse(null);
        Product paper = productRepository.findBySku("PAP-004").orElse(null);
        Product markers = productRepository.findBySku("MRK-007").orElse(null);

        if (rahul == null || priya == null || james == null || mouse == null || paper == null || markers == null) {
            return;
        }

        SalesOrderRequest draftOne = new SalesOrderRequest();
        draftOne.setCustomerId(rahul.getId());
        draftOne.setTaxAmount(BigDecimal.ZERO);
        draftOne.setNotes("Seed draft order for Rahul");
        draftOne.setItems(List.of(item(mouse.getId(), 2)));
        salesOrderService.create(draftOne);

        SalesOrderRequest draftTwo = new SalesOrderRequest();
        draftTwo.setCustomerId(priya.getId());
        draftTwo.setTaxAmount(new BigDecimal("5.00"));
        draftTwo.setNotes("Seed draft order for Priya");
        draftTwo.setItems(List.of(item(paper.getId(), 5)));
        salesOrderService.create(draftTwo);

        SalesOrderRequest confirmed = new SalesOrderRequest();
        confirmed.setCustomerId(james.getId());
        confirmed.setTaxAmount(new BigDecimal("2.00"));
        confirmed.setNotes("Seed confirmed order for James");
        confirmed.setItems(List.of(item(markers.getId(), 2)));
        var created = salesOrderService.create(confirmed);
        try {
            salesOrderService.confirm(created.getId());
        } catch (Exception ignored) {
            // Skip confirmed seed when stock is unavailable in existing databases.
        }
    }

    private SalesOrderItemRequest item(Long productId, int quantity) {
        SalesOrderItemRequest request = new SalesOrderItemRequest();
        request.setProductId(productId);
        request.setQuantity(quantity);
        return request;
    }

    private void seedDemoAuditLogs() {
        if (auditLogRepository.existsByDescription("Demo environment initialized")) {
            return;
        }

        auditLogService.log(
                AuditAction.SYSTEM,
                "System",
                null,
                "Demo environment initialized",
                "SYSTEM"
        );
    }

    private void seedDemoNotifications() {
        userRepository.findByEmail("admin@business.local").ifPresent(this::seedWelcomeNotification);
        userRepository.findByEmail("manager@business.local").ifPresent(this::seedWelcomeNotification);

        Product chair = productRepository.findBySku("CHR-003").orElse(null);
        if (chair != null) {
            userRepository.findByEmail("admin@business.local").ifPresent(admin -> {
                if (!notificationRepository.existsByUserIdAndTypeAndReferenceEntityTypeAndReferenceEntityIdAndReadFalse(
                        admin.getId(), NotificationType.LOW_STOCK, "Product", chair.getId())) {
                    notificationRepository.save(Notification.builder()
                            .user(admin)
                            .type(NotificationType.LOW_STOCK)
                            .title("Low stock alert")
                            .message("Low stock: Office Chair has only 2 units remaining.")
                            .read(false)
                            .referenceEntityType("Product")
                            .referenceEntityId(chair.getId())
                            .build());
                }
            });
        }

        invoiceRepository.findAll().stream()
                .filter(invoice -> invoice.getStatus() == InvoiceStatus.UNPAID)
                .findFirst()
                .ifPresent(invoice -> userRepository.findByEmail("manager@business.local").ifPresent(manager -> {
                    if (!notificationRepository.existsByUserIdAndTypeAndReferenceEntityTypeAndReferenceEntityIdAndReadFalse(
                            manager.getId(), NotificationType.INVOICE_DUE, "Invoice", invoice.getId())) {
                        notificationRepository.save(Notification.builder()
                                .user(manager)
                                .type(NotificationType.INVOICE_DUE)
                                .title("Invoice due")
                                .message("Invoice " + invoice.getInvoiceNumber() + " is unpaid.")
                                .read(false)
                                .referenceEntityType("Invoice")
                                .referenceEntityId(invoice.getId())
                                .build());
                    }
                }));
    }

    private void seedWelcomeNotification(User user) {
        if (notificationRepository.existsByUserIdAndTitle(user.getId(), "Welcome to Business Management")) {
            return;
        }

        notificationRepository.save(Notification.builder()
                .user(user)
                .type(NotificationType.SYSTEM)
                .title("Welcome to Business Management")
                .message("Your dashboard, audit logs, and notifications are ready.")
                .read(false)
                .build());
    }
}
