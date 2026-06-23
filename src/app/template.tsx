import { ViewTransition } from "react";

/**
 * Wraps every route in React's <ViewTransition> so page-to-page navigations
 * animate. The template re-mounts on every route change, giving React the
 * old/new pair it needs to diff.
 *
 * Direction is communicated through transitionTypes on <Link>:
 *   nav-forward — blog card → detail (content rises in from the right)
 *   nav-back    — "← Back to blogs" (content comes in from the left)
 *   (untagged)  — cross-fade with a gentle upward rise
 *
 * Reduced motion is handled entirely in CSS so this stays a pure server
 * component with no client-side hooks.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "enter-fwd",
        "nav-back":    "enter-back",
        default:       "enter-page",
      }}
      exit={{
        "nav-forward": "exit-fwd",
        "nav-back":    "exit-back",
        default:       "exit-page",
      }}
    >
      {children}
    </ViewTransition>
  );
}
