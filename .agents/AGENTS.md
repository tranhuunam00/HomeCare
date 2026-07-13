# Project Architectural Guidelines

All agents working on this repository must adhere to the following rules:

1.  **Architecture Pattern (Domain-Driven Design):**
    *   From now on, all code modifications, backend services, endpoints, and frontend state management schemas must be written according to Domain-Driven Design (DDD) principles.
    *   Separate logic clearly into Domain (entities, aggregates, repositories), Application (use cases, DTOs), and Infrastructure (DB connections, HTTP controllers, frameworks) layers.
    *   Business operations must be driven by rich domain entities and aggregates instead of anemic service layers.

2.  **No Arbitrary Emojis/Icons:**
    *   Do not use arbitrary emoji icons in button labels, modals, tab headers, or layout sections unless explicitly requested.

3.  **No Automatic Git Commits:**
    *   Do not automatically perform git commits (`git commit`) or git pushes (`git push`). Code commits and repository pushes must be handled by the user themselves, or only executed when explicitly instructed by the user.
