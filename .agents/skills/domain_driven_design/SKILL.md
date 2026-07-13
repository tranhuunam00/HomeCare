---
name: domain_driven_design
description: Guidelines and instructions for writing code using Domain-Driven Design (DDD) principles.
---

# Domain-Driven Design (DDD) Development Guidelines

From now on, all code modifications, refactorings, and new features must follow DDD principles to ensure a highly maintainable, business-centric codebase.

## 1. Core Structural Layers
Always divide the code into clean domain, application, and infrastructure layers:

*   **Domain Layer (Core):**
    *   Contains the business logic, rules, and model state.
    *   **Entities:** Objects with a unique identity that persists over time.
    *   **Value Objects:** Immutable objects defined solely by their attributes (e.g. patient details configuration, transition conditions).
    *   **Aggregates:** A cluster of associated objects treated as a single unit of data change. Define clear **Aggregate Roots** (e.g., PatientDiagnose) through which all state changes are funneled.
    *   **Domain Services:** Stateless services containing pure business operations that do not naturally belong to a single entity.
    *   **Repository Interfaces:** Outlines how domain entities are retrieved and saved, independent of actual database technologies.
    *   *No dependencies on third-party libraries, databases, or frameworks in this layer.*

*   **Application Layer:**
    *   Defines the user workflows and business use cases.
    *   Orchestrates domain objects and repositories to execute operations.
    *   Exposes clean DTOs (Data Transfer Objects) instead of leaking raw domain objects to the outside world.
    *   Handles cross-cutting concerns like transaction boundaries, logging, and security.

*   **Infrastructure Layer:**
    *   Implements repository interfaces using DB libraries (Sequelize, PostgreSQL, MinIO, Axios clients).
    *   Handles HTTP routing, framework configurations (Nest.js, React controllers), and external service integrations.

## 2. Coding Rules
*   **Encapsulation:** Never allow arbitrary state mutations from outside aggregate boundaries (e.g., avoid modifying node positions directly without validation). State transitions must occur via explicit, validated domain methods.
*   **Ubiquitous Language:** Class names, methods, and variables must correspond strictly to real-world medical concepts (e.g., reception, diagnostic reading, board consultation, certificate verification).
