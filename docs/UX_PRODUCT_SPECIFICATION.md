# AGP Structured Filing Experience

## UX and Product Specification — Revised

**Status:** Proposed redesign specification
**Product:** AGP — offline digital account filing system
**Primary user:** Daniel, a technical or digital user who needs one organized local reference for accounts, clients, projects, platforms, categories, contacts, and links
**Author:** Manus AI

## 1. Product objective

AGP must feel like a **structured filing application**, not a collection of database forms. Its purpose is to help Daniel answer practical questions quickly without relying on memory, scattered notes, or a large spreadsheet.

The product should help Daniel answer the following questions:

- What accounts do I have?
- Which category and platform does an account belong to?
- What email address or phone number identifies the account?
- Which client or project is connected to the account?
- Which accounts belong to this client or project?
- Which platforms and accounts are filed under this category?
- What reference links or contact details did I save?

The product must prioritize **clarity, retrieval, and structure** over displaying every available field at once.

## 2. Core information hierarchy

AGP has three primary working records and two supporting filing contexts.

| Entity | Role | Direct relationships |
|---|---|---|
| Account | Core digital-account record | Optional clients and projects; one category; one platform |
| Client | Core person, organization, or personal context record | Optional accounts and projects |
| Project | Core body-of-work record | Optional clients and accounts |
| Platform | Supporting account context | Accounts only |
| Category | Supporting filing context | Accounts and platforms |

The intended relationship model is:

```text
Client ↔ Project
Client ↔ Account
Project ↔ Account
Account → Platform
Account → Category
Platform → Accounts
Category → Accounts and Platforms
```

A project does not directly belong to a platform. A client does not directly belong to a platform. Platform information is meaningful because it identifies the service used by an account.

The application must not create artificial platform-to-project or platform-to-client relationships merely to expose more data.

## 3. Application shell and bottom navigation

The app must open into an **Overview** or **Dashboard** tab. No register is the mandatory landing screen.

The primary bottom navigation should contain four or five stable tabs:

| Tab | Purpose |
|---|---|
| Overview | Entry point, attention summary, and navigation to every major register |
| Accounts | Searchable account register and account creation flow |
| Clients | Searchable client register and client creation flow |
| Projects | Searchable project register and project creation flow |
| More | Settings, Categories, Platforms, security, and local maintenance |

The exact tab labels may vary, but the information architecture must remain stable. Tabs represent Daniel’s main jobs rather than every entity in the data model.

The Overview tab may contain useful attention indicators, but it must not be required to display totals such as the number of accounts, categories, or platforms. Counts are optional supporting information, not the purpose of the landing screen.

## 4. Overview tab

The Overview tab must function as a calm entry point rather than a dashboard full of metrics.

It should provide clear destinations such as:

- Open Accounts.
- Open Clients.
- Open Projects.
- Browse Categories.
- Browse Platforms.
- Review subscriptions or records needing attention.
- Open Settings or More.

The Overview tab may show a small number of attention items, such as subscriptions nearing renewal or records needing verification. These must be actionable and must not overwhelm the page.

The Overview tab must not become a second dense register. It should answer: **Where do I want to go?**

## 5. Register design principles

Every register must have a consistent structural pattern while preserving entity-specific information priorities.

Each register should provide:

- A title.
- A search field.
- A visible result count or empty-state message.
- A Sort action.
- A Filter action where relevant.
- A primary Add action.
- A clean list of records.
- A context menu on each row or through the detail view.

A register row must not summarize every relationship and field. The row should show the smallest useful amount of information for that entity. The detail screen is responsible for the complete context.

The visual model should be closer to a clear messaging or filing list than to a spreadsheet. A row should provide identity, one or two meaningful context values, and a small number of secondary signals.

### 5.1 Account register rows

The primary account row should show:

- Account name.
- Platform.
- Category.
- Email or phone when available.
- Account status.

Client and project counts may appear as compact secondary indicators, but full client and project names should not be forced into every row.

The row must open the Account Detail screen. It must not expand an editor inline.

### 5.2 Client register rows

A client row should show:

- Client name.
- A concise contact value when available.
- Account count.
- Project count.
- Active or archived state where relevant.

The row must not show every contact, link, account, and project. Those belong on Client Detail.

### 5.3 Project register rows

A project row should show:

- Project name.
- Short description or status.
- Primary client context when available.
- Account count.
- Active, paused, or archived state where relevant.

The row must not show every account, link, note, and client.

### 5.4 Category register rows

A category row should show only:

- Category name.
- Category description.

An account count or platform count may appear as a restrained secondary indicator, but the category row must remain primarily name and description.

### 5.5 Platform register rows

A platform row should show:

- Category.
- Platform name.
- Description.
- Last-modified date or account count as a secondary value when useful.

A platform row must not display client or project context because platforms are associated with accounts, not directly with clients or projects.

## 6. Proportional search, filtering, and sorting

Search, filtering, and sorting are important retrieval aids, but AGP must not turn a small local filing tool into an analytics console. Each register should provide only the controls that help Daniel find records in that register.

### 6.1 Search

Every register should provide one prominent search field. Search should cover the record’s name and the most likely context Daniel remembers.

| Register | Search scope |
|---|---|
| Accounts | Account name, email, phone, username, platform, category, client, and project |
| Clients | Client name, contact values, project names, and account names |
| Projects | Project name, description, client names, and account names |
| Categories | Category name and description |
| Platforms | Platform name, category, and description |

Search should not require Daniel to configure fields before searching. Advanced field-by-field query construction is unnecessary for the MVP.

### 6.2 Filters

Filters should be available through one reusable Filter action or bottom sheet. The sheet must show only filters relevant to the current register.

The Accounts register may filter by status, category, platform, client, project, and subscription state. The Clients register may filter by active or archived state and relationship presence. The Projects register may filter by status, client, and archived state. Platforms may filter by category and archived state. Categories may filter by archived state.

Filters should be added only when they solve a real retrieval problem. Counts, tags, verification state, and other secondary fields should not automatically become filters merely because they exist in the data model.

The active filter summary must be visible near the list. Daniel must have a single Clear filters action.

### 6.3 Sorting

Each register should provide a small sort menu with the two or three most useful sort fields for that entity. The menu must support reversing the current direction.

The default sort should be selected for practical retrieval, usually recently updated or name A–Z. Examples of useful options are:

- Accounts: name, recently updated, platform, or category.
- Clients: name or recently updated.
- Projects: name, status, or recently updated.
- Categories: name or recently updated.
- Platforms: name, category, or recently updated.

Daniel must be able to tap the current sort again to reverse its direction, such as A–Z to Z–A or newest to oldest. The product does not need a long list of every possible field and direction.

Sort and filter controls should be reusable, compact, and easy to dismiss. They should not occupy permanent space above the record list.

## 7. Field-state presentation and progressive disclosure

AGP must distinguish between **empty**, **not applicable**, and **present** values.

Every field defined for a record must be represented to the user in the relevant form and detail view, even when it has no value. The interface must not silently hide a field because it is optional or currently empty.

The display rules are:

| Field state | Display treatment |
|---|---|
| Present value | Show the value with its field label |
| Empty optional field | Show the field label with an em dash (`—`) or equivalent empty marker |
| Explicitly not applicable | Show the field label with **Not applicable** |
| Not yet decided | Show the field label with **Not specified** where that state is distinct from empty |

An empty value is not the same as Not applicable. For example, an account with no recorded phone number should show `Phone —`. An account for which Daniel has explicitly selected that subscription does not apply should show `Subscription: Not applicable`.

Forms must provide an intentional choice for fields that support Not applicable. The application must not infer Not applicable from an empty value.

### 7.1 Subscription state

Subscription information must remain visible in the account form and account detail view even when it does not apply. The user may select a value such as Active, Free, Trial, Cancelled, Expired, Paused, or Not applicable.

When Not applicable is selected, the related subscription fields may be disabled or omitted from data entry for that step, but the subscription field itself must remain visible and must display `Not applicable` in the review and detail view.

### 7.2 Detail-screen progressive disclosure

A detail screen must show the most relevant fields first, then provide a clear **Show more** or **View all fields** action. It must not dump every field immediately on first open.

The initial detail view should contain:

- Record identity.
- Primary status.
- The most important classification or relationship context.
- A concise preview of available contact or link information.
- A clear Show more action.
- A context menu for record actions.

When Daniel taps Show more, the complete field register expands in a structured, scrollable layout. Every defined field must then be visible with its value, dash, Not applicable, or Not specified state.

Show more is a presentation control, not a data filter. It must not remove fields or change their values.

### 7.3 Long values

Any potentially long field must be readable without breaking the layout. Long notes, descriptions, URLs, tags, contact descriptions, and custom link labels must use wrapping or an individually scrollable value area.

The detail screen itself must scroll. A long URL must not force a row beyond the screen boundary. Long text should be expandable where necessary, while preserving the field label.

## 8. Detail screens and context menus

Every record type must have a detail screen:

- Account Detail.
- Client Detail.
- Project Detail.
- Category Detail.
- Platform Detail.

The detail screen is for understanding, navigation, and controlled actions. It must not end with a long row of Edit, Archive, Delete, Attach, and Restore buttons.

Each detail screen must provide a context menu, typically represented by an overflow or “More” action. The menu may contain:

- Edit.
- Archive.
- Restore.
- Delete, where permitted.
- Attach or detach related records.
- Open links.
- View related records.
- Other entity-specific actions.

Destructive actions must use confirmation. Context menus must be reusable across record types and must be placed consistently.

### 7.1 Account Detail

Account Detail should present information in this order:

1. Account name and status.
2. Platform and category.
3. Email and phone, when present.
4. Username and primary link, when present.
5. Related clients.
6. Related projects.
7. Subscription context.
8. Additional links.
9. Notes, tags, and verification context.

Every related client and project must be individually tappable. The platform must be tappable as account context. The platform detail must not imply a direct project or client relationship.

### 7.2 Client Detail

Client Detail should present:

- Client name and description or context.
- Contact methods.
- Links.
- Related projects.
- Related accounts.
- Notes.

Every project and account row must be individually tappable.

### 7.3 Project Detail

Project Detail should present:

- Project name.
- Description.
- Status.
- Related clients.
- Related accounts.
- Links.
- Notes.

Every client and account row must be individually tappable.

### 7.4 Category Detail

Category Detail should present:

- Category name.
- Description.
- Accounts filed under the category.
- Platforms used by those accounts.

The primary navigable records are accounts and platforms. The category must not claim ownership of clients or projects.

### 7.5 Platform Detail

Platform Detail should present:

- Platform name.
- Category.
- Description.
- Links.
- Accounts using the platform.

It must not show projects or clients as direct platform relationships. Daniel reaches project and client context by opening an account.

## 9. Focused creation flows

Creation flows must use dedicated screens, bottom sheets, or modal forms. They must not expand a long form inline inside a register.

The application must not use a row of section-switching buttons as a substitute for a focused flow. A multi-step flow should feel like a sequence of pages or screens, with one decision at a time.

Each step must have:

- A clear question or purpose.
- A Back action.
- A Next or Continue action.
- A visible step title or progress indicator.
- Only the fields relevant to that step.
- Preserved draft values when Daniel goes backward.

Forms should auto-close when Daniel taps outside a dismissible modal or bottom sheet. Unsaved drafts must not be silently lost. Destructive dismissal should ask for confirmation when meaningful data has been entered.

## 10. Account creation flow

Account creation is a booklet-style flow.

### Page 1: Select category

The first page must show only category selection.

It must provide:

- Category search.
- Category list.
- Category name and description.
- Sort where useful.
- An Add category action at the end of the list.

Add category must not be a competing top-level action that distracts from selection. It belongs at the end of the list as the answer to “I cannot find the category I need.”

The category form contains:

- Category name, required.
- Description, optional.
- Save and Cancel.

After save, the new category is selected automatically.

### Page 2: Select platform

The second page must show only platforms belonging to the selected category.

It must provide:

- Selected category context.
- Search within the filtered platform list.
- Platform name and description.
- Sort where useful.
- An Add platform action at the end of the list.

Add platform opens one focused platform form. It does not open another multi-step workflow.

### Page 3: Account identity

Fields:

| Field | Requirement |
|---|---|
| Account name | Required |
| Login email | Optional |
| Login phone number | Optional |
| Username | Optional |
| Primary link | Optional |

An account may be identified by phone, email, username, or a combination. A login email is not required.

### Page 4: Optional relationships

The page provides two focused actions:

- Select or add clients.
- Select or add projects.

Each selection opens a separate searchable multi-select screen. Add new appears at the end of the relevant list. Creating a new account from a project or client selection must open the full account flow, not a reduced inline form.

Clients and projects are optional. A personal account without either relationship is valid.

### Page 5: Subscription

Subscription fields are separate from identity and relationships:

- Subscription status.
- Subscription plan.
- Billing cycle.
- Start date.
- Renewal date.
- Expiry date.
- Non-sensitive payment notes.

All are optional.

### Page 6: Operational context

Fields may include:

- Account status.
- Priority.
- Last verified date.
- Tags.
- Notes.
- Additional links.

### Page 7: Review and save

The review page summarizes the completed account and provides direct navigation back to any incomplete step.

## 11. Client creation flow

Client creation should use a dedicated focused form because its information is coherent and relatively small.

Fields:

- Client name, required.
- Optional description or context.
- Optional contact methods.
- Optional links.
- Optional notes.

The client should be saved before relationships are attached. After saving, Daniel may attach accounts and projects from the Client Detail context menu or focused relationship sheets.

The client list must not expand the create form inline.

## 12. Project creation flow

Project creation should use focused screens because it includes relationships.

### Page 1: Project identity

- Project name, required.
- Description, required or strongly recommended.
- Status.

### Page 2: Clients

- Search clients.
- Sort clients.
- Multi-select clients.
- Add client at the end of the list.
- Skip action because clients are optional.

### Page 3: Accounts

- Search accounts.
- Sort accounts.
- Multi-select accounts.
- Add account through the full account flow.
- Skip action because accounts are optional.

### Page 4: Links and notes

- Optional custom links.
- Optional notes.

### Page 5: Review and save

The review summarizes the project, clients, accounts, links, notes, and status.

The project flow must not include a platform selector. Platform context is obtained from the selected accounts.

## 13. Platform creation flow

Platform creation is intentionally short and remains a single focused form.

Fields:

- Platform name, required.
- Category, required when created independently and preselected when created from account setup.
- Description, optional.
- Links, optional.

Platform creation must not include clients, projects, subscriptions, or account relationship selectors.

A platform may be created from:

- The end of a filtered platform list during account creation.
- Platform management in More or Settings.
- Category management when that is a useful entry point.

## 14. Links and contact methods

Links are additional user-provided context. They are not system-managed or destination-verified data.

A link entry contains:

- A free-form label.
- A URL.
- Optional context note only if the product later proves this necessary.
- Optional primary designation.

The user must be able to add a default primary link and rename its label. Additional links must be added through a reusable link editor with a clear Add link action.

Examples include:

```text
Production site → https://example.com
Testing site → https://staging.example.com
Client portal → https://portal.example.com
Documentation → https://docs.example.com
```

The app validates that the value has an acceptable URL shape and can be handed to the device link handler. It must not check whether the destination works or whether the label matches the destination.

Links are optional on every record.

Contact methods follow the same reusable pattern:

- Default channels may include phone, email, and WhatsApp.
- Daniel may add a custom channel.
- Custom labels are free form.
- A contact context description is optional.

## 15. Account phone number

The account record must include an optional phone number in addition to the optional login email.

Valid examples include:

| Account | Email | Phone | Valid? |
|---|---|---|---|
| Facebook account | Present | Empty | Yes |
| Facebook account | Empty | Present | Yes |
| Facebook account | Present | Present | Yes |
| Facebook account | Empty | Empty | Yes, if another identity such as username or account name is sufficient |

The list may show the available email or phone as a compact identifier. The detail screen should label them clearly as login or account contact information.

## 16. Duplicate detection

Before saving a record, the app should detect likely duplicates and ask Daniel for confirmation.

The app must not silently block legitimate records. The confirmation should state that a similar record already exists and provide Cancel, Review, and Create anyway actions.

Possible duplicate rules:

- Account: same normalized account name, email, phone where applicable, platform, and category.
- Client: same normalized client name.
- Project: same normalized project name, with client context shown when available.
- Platform: same normalized name within the same category.
- Category: same normalized name.

The comparison should normalize case and repeated spaces. It should be described as a similarity warning, not a claim of identity.

## 17. Reusable design and implementation patterns

The redesigned experience must be built from reusable components and hooks rather than repeated screen-specific implementations.

Reusable components should include:

- Bottom tab shell.
- Safe-area screen container.
- Register header.
- Search field.
- Sort sheet with reversible direction.
- Filter sheet with clear-all behavior.
- Sparse record row.
- Overflow context menu.
- Detail relationship row.
- Multi-select relationship picker.
- Add-new-at-end list action.
- Focused form page.
- Step progress indicator.
- Link editor.
- Contact editor.
- Duplicate warning dialog.
- Confirmation dialog.
- Dismissible bottom sheet or modal.
- Empty state.
- Archived state.

Reusable hooks should include:

- Search and query state.
- Sort field and direction state.
- Filter state.
- Draft form persistence across steps.
- Relationship selection and return flow.
- Duplicate detection.
- Modal and bottom-sheet dismissal behavior.
- Record lifecycle actions.

A feature must pull from these shared patterns instead of recreating a new search bar, filter interaction, context menu, or relationship selector for each register.

## 18. Security and device layout

If Daniel configures a PIN, AGP must require it on first open before any register data is visible. It must also lock when the app leaves the foreground.

The lock screen must provide:

- Automatically focused PIN input.
- Numeric keyboard.
- Obscured PIN entry.
- Keyboard submit behavior.
- A visually recognizable biometric action.
- Safe-area spacing.
- Clear error feedback.

Every screen must respect device safe areas. Back buttons, titles, add actions, and toolbars must not overlap the status bar or camera cutout.

Long forms must support keyboard avoidance and scrolling. Bottom sheets and modals must close when appropriate when Daniel taps outside them, while protecting meaningful unsaved input from accidental loss.

Password storage and cloud backup remain outside the MVP. AGP must present itself as an organized local filing system, not as a secure password vault or synchronization service.

## 19. Acceptance criteria

The redesign is acceptable when Daniel can complete these tasks without dense inline expansion or unclear controls.

| Scenario | Expected experience |
|---|---|
| Launch AGP | Overview opens first; bottom tabs provide Accounts, Clients, Projects, and More |
| Find a client’s Facebook account | Open Clients, search the client, open Client Detail, open the related account, and see platform, category, email or phone, and project context |
| Find AI accounts | Open Categories from Overview or More, select AI, and browse the accounts filed under it |
| Add an account | Select category on page one, select a filtered platform on page two, complete focused identity and relationship steps, review, and save |
| Add a platform | Enter platform name, category, optional description, and optional links in one focused form |
| Add a project | Enter project basics, optionally select clients and accounts through dedicated screens, add optional links and notes, review, and save |
| Add a client | Enter client identity, optionally add contacts and links, save, and attach relationships from the detail context menu |
| Add a phone-only account | Leave email empty, enter a phone number, and save successfully |
| Add a custom link | Provide a free-form label and URL-shaped value, then open the link from detail |
| Sort a register | Choose a field and reverse its direction without leaving the register |
| Manage a detail record | Open the context menu rather than finding controls at the bottom of a long detail screen |
| Detect a duplicate | See a similarity warning and choose whether to cancel, review, or create anyway |
| Protect the app | Configure a PIN, close and reopen AGP, and encounter the lock before records are visible |
| Use a small device | See no overlap with the status bar, safe-area boundary, or keyboard |

## 20. Final product principle

AGP should feel like a **small, deliberate filing system**.

The Overview tab answers: **Where do I want to go?**

A register answers: **Which records exist, and how can I find one?**

A detail screen answers: **What is this record connected to?**

A focused form answers: **What is the next decision I need to make?**

A context menu answers: **What can I do with this record?**

No screen should dump every field on first open merely because it exists in the data model. The initial view should display the information that helps Daniel make the next useful decision. Show more must then expose every defined field, including fields whose state is empty or Not applicable.

Search, filtering, and sorting should be powerful enough to retrieve records but simple enough that Daniel does not need to configure a query language. Structure comes from clear lists, proportional controls, explicit field states, progressive disclosure, and consistent context menus.

## References

This specification is derived from the stakeholder product brief and the subsequent product-direction clarifications provided for AGP. No external product requirements were used.

[1]: https://www.nngroup.com/articles/ten-usability-heuristics/ "Nielsen Norman Group usability heuristics"
