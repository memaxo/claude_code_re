# Control Flow Analysis: n9

## Function Signature

```javascript
function n9(c) { ... }
```

## Control Flow Summary

| Category | Count | Details |
|----------|-------|--------|
| If Statements | 4 | Lines: 193121, 193122, 193123, 193130 |
| Switch Statements | 0 | None |
| Loops | 0 | For: 0, While: 0, DoWhile: 0, ForIn: 0, ForOf: 0 |
| Try/Catch Blocks | 0 | None |
| Return Statements | 1 | Lines: 193130 |
| Yield Expressions | 0 | None |
| Await Expressions | 0 | None |
| Function Calls | 3 | Total calls: 3 |

## If Statement Branches

| Line | Condition | Has Else | Consequent Lines | Alternate Lines |
|------|-----------|----------|-----------------|----------------|
| 193121 | `y1.length > 0` | No | 193121-193121 | N/A |
| 193122 | `t1` | No | 193122-193131 | N/A |
| 193123 | `SequenceExpression` | No | 193129-193129 | N/A |
| 193130 | `c.length === 0` | No | 193130-193130 | N/A |

## Function Calls

| Function | Call Count | Lines |
|----------|------------|-------|
| `F2` | 1 | 193121 |
| `c.substring` | 1 | 193129 |
| `B4` | 1 | 193132 |
