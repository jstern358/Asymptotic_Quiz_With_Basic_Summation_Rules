# Asymptotic Runtime Trainer

## Template-combinator expansion in this update
- Added a broader safe factorable body-cost library: \(\{1, \log n, n, n^2\}\).
- Refactored the question generator so polynomial, exponentially-increasing, and exponentially-decreasing problems are built from reusable families rather than one-off templates.
- Added new families that combine safe factorable body costs with canonical, shifted, scaled, and exponential summation forms.
- Preserved the theorem-safe workflow: form the sum -> simplify the sum -> determine the type -> evaluate the sum.
