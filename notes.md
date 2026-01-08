- What is the color theme?
    - Self define and customize
        - lll
- What UI libraries are recommended?
    - simplistic but formal ✅
    - Value on UX for an internal console
    - Add Modernize components by yourself

- User table (RBAC) fixed?
    - return user-friendly error message to frontend
    - handle the backend response correctly

---

## Color Mapping Table

| Role | Color Name | HSL Value | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | White | `0 0% 100%` | Main content area base |
| **Surface** | Light Gray | `220 14% 96%` | Cards, sidebars, section backgrounds |
| **Primary** | Blue | `227 100% 68%` | Approve buttons, active states, primary links |
| **Primary Light** | Light Blue | `210 100% 95%` | Hover states, selected table rows |
| **Secondary** | Slate | `220 14% 40%` | Body text, icons, secondary actions |
| **Success** | Teal/Green | `165 82% 47%` | Approved badges, success dialogs |
| **Destructive** | Coral/Red | `15 94% 70%` | Reject buttons, error states, critical alerts |
| **Warning** | Amber | `40 100% 56%` | Pending badges, warning icons |
| **Muted** | Gray | `220 9% 46%` | Placeholder text, disabled UI elements |

---

Use ChatGPT prompt -> Lovable AI (agent mode) -> Screenshot the design -> Continue on Gemini if needed -> Cursor

Improve the cohesiveness of `audit` and `dashboard` and reduce their coupling by breaking down the code into `components`  and `sub-page.tsx`. Then ensure `src/lib/api` have the same file structure as onboarding (zod schema, transformers)