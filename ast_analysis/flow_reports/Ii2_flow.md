# Control Flow Analysis: Ii2

## Function Signature

```javascript
function Ii2(I) { ... }
```

## Control Flow Summary

| Category | Count | Details |
|----------|-------|--------|
| If Statements | 3 | Lines: 244040, 244049, 244051 |
| Switch Statements | 0 | None |
| Loops | 1 | For: 0, While: 0, DoWhile: 0, ForIn: 0, ForOf: 1 |
| Try/Catch Blocks | 1 | Lines: 244041 |
| Return Statements | 4 | Lines: 244040, 244049, 244054, 244059 |
| Yield Expressions | 0 | None |
| Await Expressions | 0 | None |
| Function Calls | 8 | Total calls: 9 |

## If Statement Branches

| Line | Condition | Has Else | Consequent Lines | Alternate Lines |
|------|-----------|----------|-----------------|----------------|
| 244040 | `!G` | No | 244040-244040 | N/A |
| 244049 | `V.includes(...)` | No | 244049-244049 | N/A |
| 244051 | `V.includes(...)` | No | 244051-244055 | N/A |

## Loops

### For...Of Loops

| Line | Left | Right | Await |
|------|------|-------|-------|
| 244053 | `undefined` | `w` | No |

## Error Handling

| Line | Try Block | Catch Parameter | Has Finally |
|------|----------|-----------------|-------------|
| 244041 | 244041-244056 | `B` (244056-244058) | No |

## Function Calls

| Function | Call Count | Lines |
|----------|------------|-------|
| `V.includes` | 2 | 244049, 244051 |
| `gO` | 1 | 244042 |
| `[expr].replaceAll` | 1 | 244043 |
| `S61` | 1 | 244043 |
| `qV` | 1 | 244043 |
| `Ec5` | 1 | 244050 |
| `X.replaceAll` | 1 | 244053 |
| `l1` | 1 | 244057 |
