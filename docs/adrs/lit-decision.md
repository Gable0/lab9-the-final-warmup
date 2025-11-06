# 0001 - Adopt Lit for the Task Manager UI

- Status: Accepted
- Deciders: Team Lab9
- Date: 2024-03-10

## Context

The existing code base already uses Lit to compose the task manager UI. We needed to confirm whether to keep that dependency or migrate to another solution such as vanilla web components, React, or Vue. Key concerns included component reuse, performance, developer ergonomics, and the learning curve for new contributors.

## Decision

We will keep Lit as the presentation layer for this repository.

## Consequences

- Lit provides a declarative template syntax and reactive property system, so developers can focus on business concerns instead of low-level DOM updates.
- The dependency footprint stays small (Lit plus Vite for tooling), which keeps bundle size and complexity manageable for students ramping up on modern tooling.
- Using Lit aligns with the course objective of understanding web components while still allowing us to adopt patterns that resemble frameworks students might see in industry.
- Future contributors should continue to invest in Lit knowledge and follow its best practices (e.g. strict property definitions, templated styles) to maintain consistency.
