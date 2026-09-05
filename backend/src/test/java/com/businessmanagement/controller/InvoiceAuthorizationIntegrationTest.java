package com.businessmanagement.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.businessmanagement.dto.PaymentRequest;
import com.businessmanagement.dto.SalesOrderItemRequest;
import com.businessmanagement.dto.SalesOrderRequest;
import com.businessmanagement.entity.PaymentMethod;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class InvoiceAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "STAFF")
    void staffCannotGenerateInvoice() throws Exception {
        mockMvc.perform(post("/api/invoices/from-order/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void staffCannotRecordPayment() throws Exception {
        mockMvc.perform(post("/api/invoices/1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildPaymentRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void managerCanGenerateAndPayInvoice() throws Exception {
        Long orderId = createAndConfirmOrder();
        MvcResult invoiceCreated = mockMvc.perform(post("/api/invoices/from-order/" + orderId))
                .andExpect(status().isCreated())
                .andReturn();

        Long invoiceId = objectMapper.readTree(invoiceCreated.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(post("/api/invoices/" + invoiceId + "/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildPaymentRequest())))
                .andExpect(status().isCreated());
    }

    private Long createAndConfirmOrder() throws Exception {
        SalesOrderItemRequest item = new SalesOrderItemRequest();
        item.setProductId(4L);
        item.setQuantity(1);

        SalesOrderRequest request = new SalesOrderRequest();
        request.setCustomerId(1L);
        request.setTaxAmount(BigDecimal.ZERO);
        request.setItems(List.of(item));

        MvcResult created = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        Long orderId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/orders/" + orderId + "/confirm"))
                .andExpect(status().isOk());

        return orderId;
    }

    private PaymentRequest buildPaymentRequest() {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("1.00"));
        request.setPaymentDate(LocalDate.now());
        request.setMethod(PaymentMethod.CASH);
        return request;
    }
}
