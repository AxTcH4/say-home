package com.sayhome.sayhomeapi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Property")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String description;
    private Double price;
    private String type;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;

    @Column(name = "agentId")
    private Integer agentId;
}