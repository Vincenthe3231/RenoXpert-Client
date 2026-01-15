# Onboarding Module

## Table of Content
* Onboarding Module
* Business Requirement
* Main Page Behavior (Pending Onboarding List)
* Approve Staff Onboarding
* Reject Staff Onboarding
* Key Business Controls Enforced

---

## Onboarding Module
The Onboarding Module controls how staff users are granted access to RenoXpert. It ensures that only authorized staff members can use the system by requiring Super Admin approval before access is activated. This approval process protects system security, enforces proper role allocation, and prevents unauthorized or accidental usage.

Only Super Admins are permitted to access and manage this module.

---

## Business Requirement

### Main Page Behavior (Pending Onboarding List)
* When a Super Admin opens the Onboarding Module, the system displays a list of staff users with pending onboarding requests.
* The list includes staff members only. Owners and vendors are excluded and do not appear in this module.
* Each pending request represents a staff member who has attempted to log in via Lark OAuth but does not yet have approval to access RenoXpert.
* For each staff member, the Super Admin can review basic user information required to make an approval decision.

---

### Approve Staff Onboarding

#### Business Rules
* A Super Admin may approve a staff onboarding request only after reviewing the staff member's eligibility to use RenoXpert.
* Approval is mandatory before any staff member can access system features.

#### Approval Flow
1. The Super Admin selects a pending staff onboarding request.
2. During approval, the Super Admin must assign a Staff Type, which are Admin and Staff.
3. The assigned Staff Type determines the staff member's access level and permissions within RenoXpert.
4. Once approved:
    * The staff member's onboarding status is updated to Approved.
    * The staff member will gain access to RenoXpert upon their next login.
    * The staff member will only be able to perform actions allowed by their assigned Staff Type.

#### Business Outcome
* The system ensures that every approved staff user has a clearly defined role.
* Access rights are aligned with job responsibilities and company policy.

---

### Reject Staff Onboarding

#### Business Rules
* A Super Admin may reject an onboarding request if the staff member is not authorized to use RenoXpert.
* A rejection must include a clear reason to ensure transparency and reduce confusion.

#### Rejection Flow
1. The Super Admin selects a pending staff onboarding request.
2. The Super Admin chooses to reject the request.
3. The Super Admin provides a rejection reason (e.g., incorrect role, not part of the RenoXpert user group, temporary staff, etc.).
4. Once rejected:
    * The staff member's onboarding status is updated to Rejected.
    * The rejection reason is saved by the system.

#### Staff Experience After Rejection
* On the staff member's next login attempt, they are shown a "Rejected" page.
* The page clearly displays the rejection reason provided by the Super Admin.
* The staff member does not gain access to any RenoXpert features unless a new onboarding request is submitted and approved.

#### Business Outcome
* Unauthorized access is prevented.
* Staff receive clear feedback, reducing support requests and misunderstandings.

---

## Key Business Controls Enforced
* Only Super Admins can approve or reject onboarding requests.
* Every approved staff member must have a defined Staff Type.
* Rejection decisions are transparent and traceable through documented reasons.
* Owners and vendors (or any other user types) are excluded from this onboarding workflow.
* System access is granted strictly through approval, ensuring operational integrity and security.