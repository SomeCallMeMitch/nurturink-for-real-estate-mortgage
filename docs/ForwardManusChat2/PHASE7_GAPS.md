# Phase 7: Gaps & Missing Functionality

This document identifies missing or incomplete features in the NurturInk application. The analysis includes the user-requested dashboard refactor, as well as other gaps identified during the audit.

## 1. Dashboard Refactor & Superadmin Functionality

As per the project stakeholder's feedback, the current `Home.jsx` page (acting as a dashboard) is being misused for administrative data loading for new white-label instances. This is a significant gap in both functionality and security.

### Problem Analysis

*   **Incorrect Separation of Concerns:** User-facing dashboards should provide value to the end-user (e.g., stats, recent activity). Administrative tasks like data seeding should be in a secure, separate area.
*   **Security Risk:** Exposing data loading functionality on a user-facing page, even if hidden, is a potential security risk. It could be inadvertently accessed or exploited.
*   **Poor User Experience:** The current dashboard offers little value to the end-user, failing to provide them with a useful overview of their account and activity.

### Recommendations

1.  **Create a Dedicated Superadmin Panel:**
    *   A new page, `SuperAdminDashboard.jsx`, should be enhanced or created to house all administrative data loading and seeding functions.
    *   This panel should be accessible only to users with a `super_admin` role.
    *   The functionality currently on `Home.jsx` for seeding data (e.g., `seedInitialData`, `seedTemplates`) should be moved to buttons or forms within this new superadmin panel.

2.  **Redesign the User-Facing Dashboard (`Home.jsx`):**
    *   The `Home.jsx` page should be redesigned to be a true user dashboard, providing valuable, at-a-glance information.
    *   **Key Stats to Include:**
        *   **Credits Remaining:** A clear display of the user's personal and (if applicable) team credit balance.
        *   **Recent Activity:** A list of the last 5-10 cards sent, with their status (e.g., sent, printed, shipped).
        *   **Upcoming Automations:** A view of upcoming automated sends (e.g., birthdays, anniversaries) for the next 7-30 days.
        *   **Quick Actions:** Buttons for common actions like "Send a Card", "Add a Client", or "Buy Credits".
    *   **Visualizations:** The dashboard could include simple charts, such as a pie chart showing card sends by category or a line chart of cards sent over the last month.

## 2. Configuration & Hard-Coded Values

The audit prompt raised concerns about hard-coded values that should be configurable. A review of the codebase confirms this is a significant issue that limits flexibility and maintainability.

### Problem Analysis

Throughout the codebase, there are numerous instances of values that are hard-coded directly into the functions and components. This makes it difficult to change them without modifying the code and redeploying the application.

**Examples of Hard-Coded Values:**

*   **ScribeNurture API URL:** The URL for the ScribeNurture API (`https://api.scribenurture.com/v1`) is likely hard-coded in the functions that call it. This should be a configurable environment variable to allow for easy switching between development, staging, and production environments.
*   **Email Addresses:** Email addresses for notifications (e.g., admin notifications, support requests) are often hard-coded. These should be configurable so they can be easily changed.
*   **Default Values:** Default settings, such as the default number of days before a birthday to send a card, are often hard-coded. These should be stored in a configuration entity or as instance settings.

### Recommendations

1.  **Create a `Configuration` Entity:**
    *   Create a new entity called `Configuration` or `Settings` to store all system-wide and instance-specific settings.
    *   This entity should store key-value pairs for all configurable parameters (e.g., `scribe_api_url`, `admin_email`, `default_birthday_offset`).

2.  **Refactor Code to Use Configuration Values:**
    *   Refactor all functions and components to read configuration values from the new `Configuration` entity instead of using hard-coded values.
    *   Implement a caching layer for configuration values to avoid repeated database queries.

3.  **Create a Settings UI:**
    *   In the superadmin panel, create a UI for managing these configuration settings. This will allow administrators to easily update settings without needing to touch the code.
