# Control Flow Analysis: uY

## Function Signature

```javascript
function uY(I) { ... }
```

## Control Flow Summary

| Category | Count | Details |
|----------|-------|--------|
| If Statements | 4 | Lines: 232788, 232789, 232790, 232796 |
| Switch Statements | 0 | None |
| Loops | 0 | For: 0, While: 0, DoWhile: 0, ForIn: 0, ForOf: 0 |
| Try/Catch Blocks | 0 | None |
| Return Statements | 5 | Lines: 232788, 232792, 232796, 232797, 232799 |
| Yield Expressions | 0 | None |
| Await Expressions | 0 | None |
| Function Calls | 3 | Total calls: 3 |

## If Statement Branches

| Line | Condition | Has Else | Consequent Lines | Alternate Lines |
|------|-----------|----------|-----------------|----------------|
| 232788 | `I && process.env.ANTHROPIC_API_KEY` | No | 232788-232788 | N/A |
| 232789 | `!1 === "true"` | No | 232789-232793 | N/A |
| 232790 | `!process.env.ANTHROPIC_API_KEY` | No | 232791-232791 | N/A |
| 232796 | `G` | No | 232796-232796 | N/A |

## Function Calls

| Function | Call Count | Lines |
|----------|------------|-------|
| `f0` | 1 | 232787 |
| `Au` | 1 | 232795 |
| `q91` | 1 | 232797 |
