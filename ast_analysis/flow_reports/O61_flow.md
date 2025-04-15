# Control Flow Analysis: O61

## Function Signature

```javascript
function O61(I, Z, G, W, B, V) { ... }
```

## Control Flow Summary

| Category | Count | Details |
|----------|-------|--------|
| If Statements | 2 | Lines: 244820, 244842 |
| Switch Statements | 0 | None |
| Loops | 1 | For: 0, While: 0, DoWhile: 0, ForIn: 0, ForOf: 1 |
| Try/Catch Blocks | 1 | Lines: 244841 |
| Return Statements | 2 | Lines: 244838, 244850 |
| Yield Expressions | 4 | Lines: 244827, 244849, 244852, 244855 |
| Await Expressions | 0 | None |
| Function Calls | 7 | Total calls: 10 |

## If Statement Branches

| Line | Condition | Has Else | Consequent Lines | Alternate Lines |
|------|-----------|----------|-----------------|----------------|
| 244820 | `!w` | No | 244820-244839 | N/A |
| 244842 | `B.abortController.signal.aborted` | No | 244842-244851 | N/A |

## Loops

### For...Of Loops

| Line | Left | Right | Await |
|------|------|-------|-------|
| 244852 | `H` | `cc5(...)` | Yes |

## Error Handling

| Line | Try Block | Catch Parameter | Has Finally |
|------|----------|-----------------|-------------|
| 244841 | 244841-244853 | `H` (244853-244866) | No |

## Function Calls

| Function | Call Count | Lines |
|----------|------------|-------|
| `z5` | 3 | 244827, 244849, 244855 |
| `x1` | 2 | 244821, 244843 |
| `[expr].find` | 1 | 244819 |
| `Fi2` | 1 | 244848 |
| `cc5` | 1 | 244852 |
| `l1` | 1 | 244854 |
| `String` | 1 | 244854 |
