# Audit Trail Badge Color Documentation

This document provides a comprehensive reference for all badge colors and styles used in the Audit Trail's TYPE and ACTION columns.

## Table of Contents

- [TYPE Column Badges](#type-column-badges)
- [ACTION Column Badges](#action-column-badges)
  - [Onboarding Actions](#onboarding-actions)
  - [User Management Actions](#user-management-actions)
  - [Department Management Actions](#department-management-actions)
- [Size Variants](#size-variants)
- [Dark Mode Support](#dark-mode-support)

---

## TYPE Column Badges

The TYPE column displays the category of the audit entry. All type badges use a consistent primary color scheme.

### Type Badge Styling

| Type | Background | Text Color | Border | Dark Mode Background | Dark Mode Text |
|------|------------|------------|--------|---------------------|----------------|
| **Onboarding** | `bg-primary/5` | `text-primary` | `border-primary/20` | `dark:bg-primary/10` | `text-primary` |
| **User Management** | `bg-primary/5` | `text-primary` | `border-primary/20` | `dark:bg-primary/10` | `text-primary` |
| **Department Management** | `bg-primary/5` | `text-primary` | `border-primary/20` | `dark:bg-primary/10` | `text-primary` |

### Base Styles
- **Variant**: `outline`
- **Border Radius**: `rounded-xl`
- **Backdrop**: `backdrop-blur-sm`
- **Shadow**: `shadow-sm`
- **Font Weight**: `font-medium`

### Example
```tsx
<TypeBadge typeLabel="Onboarding" size="md" />
<TypeBadge typeLabel="User Management" size="md" />
<TypeBadge typeLabel="Department Management" size="md" />
```

---

## ACTION Column Badges

The ACTION column displays the specific action or status of the audit entry. Each action type has a unique color scheme and icon.

### Onboarding Actions

| Action | Icon | Background | Text Color | Border | Dark Mode |
|--------|------|------------|-----------|--------|-----------|
| **Approved** | `CheckCircle2` | `bg-green-50` | `text-green-700` | `border-green-200` | `dark:bg-green-900/20 dark:text-green-400 dark:border-green-800` |
| **Rejected** | `XCircle` | `bg-red-50` | `text-red-700` | `border-red-200` | `dark:bg-red-900/20 dark:text-red-400 dark:border-red-800` |
| **Pending** | `Clock` | `bg-yellow-50` | `text-yellow-700` | `border-yellow-200` | `dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800` |
| **Pending (Special)** | `CheckCircle2` | `bg-yellow-50` | `text-yellow-700` | `border-yellow-200` | `dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800` |

> **Note**: "Pending (Special)" appears when an onboarding entry transitions from `pending` → `approved`. The backend sends `event: 'pending'` but the status is actually approved.

### User Management Actions

| Action | Icon | Background | Text Color | Border | Dark Mode |
|--------|------|------------|-----------|--------|-----------|
| **Activated** | `UserCheck` | `bg-green-50` | `text-green-700` | `border-green-200` | `dark:bg-green-900/20 dark:text-green-400 dark:border-green-800` |
| **Deactivated** | `UserX` | `bg-pink-50` | `text-pink-500/90` | `border-pink-500/30` | `dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800` |
| **Role Changed** | `UserCog` | `bg-blue-50` | `text-blue-700` | `border-blue-200` | `dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800` |
| **Profile Updated** | `UserPen` | `bg-purple-50` | `text-purple-700` | `border-purple-200` | `dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800` |
| **Verifying** | `Loader2` | `bg-yellow-50` | `text-yellow-700` | `border-yellow-200` | `dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800` |
| **Pending** | `Clock` | `bg-yellow-50` | `text-yellow-700` | `border-yellow-200` | `dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800` |
| **Approved** | `CheckCircle2` | `bg-green-50` | `text-green-700` | `border-green-200` | `dark:bg-green-900/20 dark:text-green-400 dark:border-green-800` |
| **Rejected** | `XCircle` | `bg-red-50` | `text-red-700` | `border-red-200` | `dark:bg-red-900/20 dark:text-red-400 dark:border-red-800` |
| **Updated** | `UserPen` | `bg-blue-50` | `text-blue-700` | `border-blue-200` | `dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800` |

### Department Management Actions

| Action | Icon | Background | Text Color | Border | Dark Mode |
|--------|------|------------|-----------|--------|-----------|
| **Created** | `CheckCircle2` | `bg-gray-50` | `text-gray-700` | `border-gray-200` | `dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800` |
| **Updated** | `UserPen` | `bg-blue-50` | `text-blue-700` | `border-blue-200` | `dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800` |
| **Deleted** | `UserX` | `bg-gray-50` | `text-gray-700` | `border-gray-200` | `dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800` |
| **Unknown/Default** | `Clock` | `bg-gray-50` | `text-gray-700` | `border-gray-200` | `dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800` |

### Color Scheme Summary

The ACTION badges use a semantic color system where each color represents a specific type of action or status. This provides immediate visual feedback about the nature of the audit entry.

#### Green - Success/Positive Actions
**Semantic Meaning**: Successful operations, approvals, and positive state changes

- **Actions**: Approved, Activated
- **Light Mode**: `bg-green-50 text-green-700 border-green-200`
- **Dark Mode**: `dark:bg-green-900/20 dark:text-green-400 dark:border-green-800`
- **Use Case**: Indicates successful completion, approval, or activation of resources

#### Red - Error/Negative Actions
**Semantic Meaning**: Rejections, errors, and negative outcomes

- **Actions**: Rejected
- **Light Mode**: `bg-red-50 text-red-700 border-red-200`
- **Dark Mode**: `dark:bg-red-900/20 dark:text-red-400 dark:border-red-800`
- **Use Case**: Indicates rejection, denial, or error conditions

#### Yellow/Amber - Pending/Warning Actions
**Semantic Meaning**: In-progress states, pending operations, and warnings

- **Actions**: Pending, Verifying
- **Light Mode**: `bg-yellow-50 text-yellow-700 border-yellow-200`
- **Dark Mode**: `dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800`
- **Use Case**: Indicates pending status, verification in progress, or warning states

#### Blue - Information/Update Actions
**Semantic Meaning**: Informational changes, updates, and modifications

- **Actions**: Role Changed, Updated (User Management), Updated (Department)
- **Light Mode**: `bg-blue-50 text-blue-700 border-blue-200`
- **Dark Mode**: `dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800`
- **Use Case**: Indicates informational updates, role changes, or general modifications

#### Purple - Profile Actions
**Semantic Meaning**: Profile-specific updates and personal information changes

- **Actions**: Profile Updated
- **Light Mode**: `bg-purple-50 text-purple-700 border-purple-200`
- **Dark Mode**: `dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800`
- **Use Case**: Indicates changes to user profile information

#### Pink - Deactivation Actions
**Semantic Meaning**: Deactivation and suspension of resources

- **Actions**: Deactivated
- **Light Mode**: `bg-pink-50 text-pink-500/90 border-pink-500/30`
- **Dark Mode**: `dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800`
- **Use Case**: Indicates deactivation or suspension of accounts or resources

#### Gray - Neutral/Default Actions
**Semantic Meaning**: Neutral operations, creation, deletion, and unknown states

- **Actions**: Created, Deleted, Unknown/Default
- **Light Mode**: `bg-gray-50 text-gray-700 border-gray-200`
- **Dark Mode**: `dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800`
- **Use Case**: Indicates neutral operations like creation/deletion, or fallback for unknown event types

---

## Size Variants

Both TYPE and ACTION badges support two size variants:

### Small (`sm`)
- **Text Size**: `text-[10px]`
- **Padding**: `px-2 py-0.5`
- **Icon Size**: `10px`
- **Usage**: Dashboard cards, compact views

### Medium (`md`) - Default
- **Text Size**: `text-xs`
- **Padding**: `px-2.5 py-1`
- **Icon Size**: `12px`
- **Usage**: Audit table, standard views

### Example
```tsx
<TypeBadge typeLabel="Onboarding" size="sm" />
<ActionBadge event="approved" size="md" />
```

---

## Dark Mode Support

All badges include comprehensive dark mode support with:

1. **Background Colors**: Reduced opacity variants (e.g., `dark:bg-green-900/20`)
2. **Text Colors**: Adjusted for contrast (e.g., `dark:text-green-400`)
3. **Border Colors**: Darker variants (e.g., `dark:border-green-800`)

### Dark Mode Pattern
```css
/* Light Mode */
bg-{color}-50 text-{color}-700 border-{color}-200

/* Dark Mode */
dark:bg-{color}-900/20 dark:text-{color}-400 dark:border-{color}-800
```

---

## Implementation Details

### Component Location
- **Config**: `apps/staff-portal/src/app/(DashboardLayout)/audit/badges/auditBadgeConfig.ts`
- **TypeBadge**: `apps/staff-portal/src/app/(DashboardLayout)/audit/badges/TypeBadge.tsx`
- **ActionBadge**: `apps/staff-portal/src/app/(DashboardLayout)/audit/badges/ActionBadge.tsx`

### Usage
```tsx
import { TypeBadge } from "./badges/TypeBadge"
import { ActionBadge } from "./badges/ActionBadge"
import { getAuditTypeLabel } from "./badges/auditBadgeConfig"

// TYPE column
<TypeBadge 
  typeLabel={getAuditTypeLabel(log.logName, entry.type, log.properties)} 
  size="md" 
/>

// ACTION column
<ActionBadge 
  event={log.event} 
  logName={log.logName}
  log={log}
  size="md"
/>
```

---

## Icon Reference

| Icon Component | Usage |
|---------------|-------|
| `CheckCircle2` | Approved, Created |
| `XCircle` | Rejected |
| `Clock` | Pending, Unknown/Default |
| `UserCheck` | Activated |
| `UserX` | Deactivated, Deleted |
| `UserCog` | Role Changed |
| `UserPen` | Profile Updated, Updated |
| `Loader2` | Verifying |

---

## Notes

1. **Consistency**: All badges use the `outline` variant from the base Badge component
2. **Hover States**: All badges include hover effects (e.g., `hover:bg-green-100`)
3. **Accessibility**: Color combinations meet WCAG contrast requirements
4. **Special Cases**: The "Pending (Special)" case handles onboarding status transitions correctly
5. **Default Fallback**: Unknown events default to gray with a capitalized label

---

*Last Updated: Generated from badge configuration files*

