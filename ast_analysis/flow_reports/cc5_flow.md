# Control Flow Analysis: cc5

## Function Signature

```javascript
function cc5(I, Z, G, W, B, V, Y, w) { ... }
```

## Control Flow Summary

| Category | Count | Details |
|----------|-------|--------|
| If Statements | 4 | Lines: 244891, 244913, 244929, 244984 |
| Switch Statements | 1 | Lines: 244946 |
| Loops | 1 | For: 0, While: 0, DoWhile: 0, ForIn: 0, ForOf: 1 |
| Try/Catch Blocks | 1 | Lines: 244943 |
| Return Statements | 3 | Lines: 244909, 244926, 244941 |
| Yield Expressions | 6 | Lines: 244898, 244915, 244930, 244953, 244970, 244992 |
| Await Expressions | 2 | Lines: 244912, 244928 |
| Function Calls | 13 | Total calls: 21 |

## If Statement Branches

| Line | Condition | Has Else | Consequent Lines | Alternate Lines |
|------|-----------|----------|-----------------|----------------|
| 244891 | `!X.success` | No | 244891-244910 | N/A |
| 244913 | `ChainExpression === !1` | No | 244913-244927 | N/A |
| 244929 | `A.result === !1` | No | 244929-244942 | N/A |
| 244984 | `!D instanceof iZ` | No | 244985-244990 | N/A |

## Switch Statements

### Switch at line 244946

Discriminant: `K.type`

| Case | Lines |
|------|-------|
| `"result"` | 244948-244963 |
| `"progress"` | 244965-244981 |

## Loops

### For...Of Loops

| Line | Left | Right | Await |
|------|------|-------|-------|
| 244945 | `K` | `D` | Yes |

## Error Handling

| Line | Try Block | Catch Parameter | Has Finally |
|------|----------|-----------------|-------------|
| 244943 | 244943-244983 | `D` (244983-244998) | No |

## Function Calls

| Function | Call Count | Lines |
|----------|------------|-------|
| `x1` | 5 | 244893, 244914, 244948, 244965, 244986 |
| `z5` | 5 | 244898, 244915, 244930, 244953, 244992 |
| `[expr].safeParse` | 1 | 244890 |
| `nc5` | 1 | 244892 |
| `Ov1` | 1 | 244911 |
| `I.validateInput` | 1 | 244912 |
| `V` | 1 | 244928 |
| `I.call` | 1 | 244944 |
| `I.renderResultForAssistant` | 1 | 244957 |
| `Ki2` | 1 | 244970 |
| `l1` | 1 | 244985 |
| `String` | 1 | 244985 |
| `lc5` | 1 | 244991 |
