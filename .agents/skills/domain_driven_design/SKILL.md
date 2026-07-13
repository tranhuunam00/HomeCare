---
name: domain_driven_design
description: Guidelines and instructions for writing code using Domain-Driven Design (DDD) principles.
---

# Domain-Driven Design (DDD) Development Guidelines

From now on, all code modifications, refactorings, and new features must follow DDD principles to ensure a highly maintainable, business-centric codebase.

## 1. Directory Structure

Organize the domain logic into separate directories according to their layers:

```
src/
├── domain/                         # Core Domain Layer (Pure TS/JS, no framework deps)
│   └── <domain-name>/
│       ├── events/                 # Domain Events (e.g. status-changed.event.ts)
│       ├── policies/               # Pure business validation policies
│       ├── <name>-status.vo.ts     # Value Objects
│       ├── <name>.aggregate.ts     # Aggregate Root (rich domain rules)
│       └── <name>.repository.interface.ts  # Repository Interfaces
│
├── application/                    # Application Layer
│   └── <domain-name>/
│       ├── use-cases/              # Use cases (orchestrates domain entities)
│       └── events/                 # Domain Event Handlers (Subscribers to handle Sockets/Notifications)
│
└── infrastructure/                 # Infrastructure Layer
    └── <domain-name>/
        └── <name>.sequelize.repository.ts  # Concrete implementations of repo interfaces
```

## 2. Core Structural Layers

Always divide the code into clean domain, application, and infrastructure layers:

*   **Domain Layer (Core):**
    *   Contains the business logic, rules, and model state.
    *   **Entities:** Objects with a unique identity that persists over time.
    *   **Value Objects (VO):** Immutable objects defined solely by their attributes (e.g., patient details configuration, status representation). Always implement validation in constructor and use getters.
    *   **Aggregates:** A cluster of associated objects treated as a single unit. Define clear **Aggregate Roots** (e.g., `PatientDiagnoseAggregate`) through which all state changes are funneled.
    *   **Domain Policies:** Pure stateless static classes implementing rules (e.g., transition guards, clinic access rights).
    *   **Repository Interfaces:** Outlines how domain entities are retrieved and saved, independent of actual database technologies (e.g., `IPatientDiagnoseRepository`).
    *   *No dependencies on third-party libraries, databases, or frameworks in this layer.*

*   **Application Layer:**
    *   Defines the user workflows and business use cases (`CreatePatientDiagnoseUseCase`, `ChangeStatusUseCase`).
    *   Orchestrates domain objects and repositories to execute operations.
    *   **Domain Event Handlers:** Class subscribers (`PatientDiagnoseEventsHandler`) that listen to emitted Domain Events and execute side effects (Socket gateway emissions, creating Notifications, sending emails, calling external APIs). This completely decouples Use Cases from system infrastructure side effects.

*   **Infrastructure Layer:**
    *   Implements repository interfaces using DB libraries (Sequelize, PostgreSQL, etc.).
    *   Maps between Sequelize database raw models and Domain Aggregate roots (via factories).
    *   Handles HTTP controllers, framework configurations, and module integrations.

## 3. Domain Events Pattern Implementation

To decouple domain behaviors from side effects, always follow this pattern:
1. **Aggregate Root** stores events in a private array and exposes helpers:
   ```typescript
   private domainEvents: IDomainEvent[] = [];
   public getDomainEvents() { return this.domainEvents; }
   public addDomainEvent(e: IDomainEvent) { this.domainEvents.push(e); }
   public clearDomainEvents() { this.domainEvents = []; }
   ```
2. When a state transition occurs inside an aggregate root method, trigger:
   ```typescript
   this.addDomainEvent(new StatusChangedEvent(this.id, this.status));
   ```
3. Inside the Application UseCase:
   - Call the repository to save the aggregate root.
   - Dispatch events from the aggregate root to the `EventsHandler`.
   - Clear events after dispatching.
   ```typescript
   await this.repo.saveAggregate(aggregate);
   const events = aggregate.getDomainEvents();
   for (const event of events) {
     await this.eventsHandler.handle(event);
   }
   aggregate.clearDomainEvents();
   ```

## 4. Framework Module Registrations
- All Use Cases (`ChangeStatusUseCase`, `CreatePatientDiagnoseUseCase`, etc.) and Event Handlers (`PatientDiagnoseEventsHandler`) must be registered in NestJS modules providers list under `src/modules/<domain-name>.module.ts` to ensure runtime dependency resolutions run successfully.
- Ensure that unit tests build service helpers (e.g., `test-helpers.ts`) reflect these constructor signature changes by mocking and injecting the proper handlers.
