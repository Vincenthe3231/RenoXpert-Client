- What is the color theme?
    - Self define and customize
        - lll
- What UI libraries are recommended?
    - aesthetic and formal - Modernize ✅
    - Value on UX for an internal console
    - Add Modernize components by yourself

- User table (RBAC) fixed?
    - return user-friendly error message to frontend
    - handle the backend response correctly
    - translate error message to more user-friendly (error handling) and avoid irreversible error

---

## Color Mapping Table

Based on the actual color values defined in `src/app/css/globals.css` and `src/app/css/theme/default-theme.css`:

| Color Name | Hex Value | RGB Value | Usage Examples |
| :--- | :--- | :--- | :--- |
| **Primary** | `#5d87ff` | `rgb(93, 135, 255)` | Primary buttons, icons, active states, links, focus rings |
| **Secondary** | `#49beff` | `rgb(73, 190, 255)` | Secondary actions, accent elements, complementary UI |
| **Success** | `#13deb9` | `rgb(19, 222, 185)` | Approved badges, active user status, success dialogs, approved onboarding decisions |
| **Warning** | `#f6b51e` | `rgb(246, 181, 30)` | Pending badges, warning icons, pending onboarding requests |
| **Error/Destructive** | `#ef4444` | `rgb(239, 68, 68)` | Rejected badges, error states, reject buttons, critical alerts, rejected onboarding decisions |
| **Info** | `#8754ec` | `rgb(135, 84, 236)` | Info badges, informational states, super-admin role badges |
| **Muted** | `#5a6a85` | `rgb(90, 106, 133)` | Placeholder text, secondary text, disabled UI elements, body text |
| **Muted Foreground** | `#737373` | `rgb(115, 115, 115)` | Muted text foreground |
| **Background** | `#ffffff` | `rgb(255, 255, 255)` | Main content area base, card backgrounds |
| **Border** | `#e5e5e5` | `rgb(229, 229, 229)` | Card borders, input borders, divider lines |
| **Foreground/Link** | `#2a3547` | `rgb(42, 53, 71)` | Primary text, links, headings |
| **Light Primary** | Dynamic | `color-mix(in oklab, #5d87ff 12%, transparent)` | Light primary backgrounds, hover states for primary elements |
| **Light Success** | Dynamic | `color-mix(in oklab, #13deb9 12%, transparent)` | Light success backgrounds, approved state indicators |
| **Light Warning** | Dynamic | `color-mix(in oklab, #f6b51e 12%, transparent)` | Light warning backgrounds, pending state indicators |
| **Light Error** | Dynamic | `color-mix(in oklab, #ef4444 12%, transparent)` | Light error backgrounds, rejected state indicators |
| **Light Gray** | `#f6f9fc` | `rgb(246, 249, 252)` | Light backgrounds, card surfaces, section backgrounds |
| **Pink Lavender (Pink-500)** | `#ec4899` | `rgb(236, 72, 153)` | Deactivated status (active state), pink lavender filter buttons |
| **Purple-500** | `#a855f7` | `rgb(168, 85, 247)` | Deactivated status (inactive state), purple filter buttons with opacity |

### Role Badge Colors (Custom Tailwind Classes)
| Role | Background | Text | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `bg-purple-50` | `text-purple-700` | `border-purple-200` | Super admin role badges |
| **Admin** | `bg-blue-50` | `text-blue-700` | `border-blue-200` | Admin role badges |
| **Staff** | `bg-gray-50` | `text-gray-700` | `border-gray-200` | Staff role badges |

### Status Badge Colors
| Status | Inactive State | Active State | Usage |
| :--- | :--- | :--- | :--- |
| **Active** | `bg-lightsuccess text-success` | `bg-success text-white` | Active user status |
| **Verifying** | `bg-lightwarning text-warning` | `bg-warning text-white` | User verification pending |
| **Deactivated** | `bg-purple-500/10 text-purple-500 border-purple-500/30` | `bg-pink-500 text-white border-pink-500` | Deactivated user status - uses pink lavender color scheme (pink-500 active, purple-500 inactive) |
| **Rejected** | `bg-lighterror text-error` | `bg-error text-white` | Rejected user/onboarding |

---

Use ChatGPT prompt -> Lovable AI (agent mode) -> Screenshot the design -> Continue on Gemini if needed -> Cursor

Improve the cohesiveness of `audit` and `dashboard` and reduce their coupling by breaking down the code into `components`  and `sub-page.tsx`. Then ensure `src/lib/api` have the same file structure as onboarding (zod schema, transformers)

## Final recommendation
| Priority 1: Create common/ module
- Immediate value: Shared pagination, filter params, response types
- Low complexity: Only shared utilities
- High reusability: Used by all modules

| Priority 2: Create constants.ts (if routes grow)
- Useful when you have many endpoints
- Can wait if the current number is manageable

| Priority 3: Create errors.ts (if error handling becomes complex)
- Useful if you need custom error handling
- Can wait if current patterns work