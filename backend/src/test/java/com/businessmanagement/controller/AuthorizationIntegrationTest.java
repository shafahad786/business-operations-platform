package com.businessmanagement.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.businessmanagement.dto.ProductRequest;
import com.businessmanagement.dto.StockChangeRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "STAFF")
    void staffCannotCreateProduct() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Test Product");
        request.setSku("TST-" + System.nanoTime());
        request.setSellingPrice(new BigDecimal("10.00"));
        request.setCostPrice(new BigDecimal("5.00"));
        request.setMinimumStockLevel(1);
        request.setActive(true);
        request.setInitialStock(0);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void managerCanCreateProduct() throws Exception {
        ProductRequest request = new ProductRequest();
        request.setName("Manager Product");
        request.setSku("MGR-" + System.nanoTime());
        request.setSellingPrice(new BigDecimal("10.00"));
        request.setCostPrice(new BigDecimal("5.00"));
        request.setMinimumStockLevel(1);
        request.setActive(true);
        request.setInitialStock(0);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void staffCannotModifyInventory() throws Exception {
        StockChangeRequest request = new StockChangeRequest();
        request.setQuantity(5);

        mockMvc.perform(post("/api/inventory/1/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void managerCanModifyInventory() throws Exception {
        StockChangeRequest request = new StockChangeRequest();
        request.setQuantity(1);

        mockMvc.perform(post("/api/inventory/1/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void staffCannotDeleteCustomer() throws Exception {
        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isForbidden());
    }
}
