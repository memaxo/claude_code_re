# Control Flow Analysis: kj2

## Function Signature

```javascript
function kj2(I, Z, G = defaultValue) { ... }
```

## Control Flow Summary

| Category | Count | Details |
|----------|-------|--------|
| If Statements | 9 | Lines: 237303, 237304, 237316, 237324, 237326, 237330, 237343, 237345, 237346 |
| Switch Statements | 0 | None |
| Loops | 3 | For: 0, While: 0, DoWhile: 0, ForIn: 0, ForOf: 3 |
| Try/Catch Blocks | 0 | None |
| Return Statements | 8 | Lines: 237303, 237305, 237316, 237317, 237326, 237332, 237336, 237356 |
| Yield Expressions | 0 | None |
| Await Expressions | 1 | Lines: 237319 |
| Function Calls | 19 | Total calls: 21 |

## If Statement Branches

| Line | Condition | Has Else | Consequent Lines | Alternate Lines |
|------|-----------|----------|-----------------|----------------|
| 237303 | `W.result` | No | 237303-237303 | N/A |
| 237304 | `qj2(...)` | No | 237305-237314 | N/A |
| 237316 | `J === TemplateLiteral` | No | 237316-237316 | N/A |
| 237324 | `Z.abortController.signal.aborted` | No | 237324-237324 | N/A |
| 237326 | `ChainExpression || B.length < 2` | No | 237326-237326 | N/A |
| 237330 | `B.every(...) && B.filter(...).length < 2` | No | 237336-237340 | N/A |
| 237343 | `!J.result` | No | 237343-237354 | N/A |
| 237345 | `A === void0` | Yes | 237345-237345 | 237346-237353 |
| 237346 | `A === null` | Yes | 237346-237349 | 237350-237353 |

## Loops

### For...Of Loops

| Line | Left | Right | Await |
|------|------|-------|-------|
| 237328 | `J` | `B` | No |
| 237342 | `J` | `w.values(...)` | No |
| 237350 | `D` | `A` | No |

## Function Calls

| Function | Call Count | Lines |
|----------|------------|-------|
| `Z.getToolPermissionContext` | 2 | 237302, 237325 |
| `bj2` | 2 | 237326, 237329 |
| `Gd1` | 1 | 237302 |
| `qj2` | 1 | 237304 |
| `[expr].filter` | 1 | 237315 |
| `TU` | 1 | 237315 |
| `l0` | 1 | 237316 |
| `G` | 1 | 237319 |
| `w.set` | 1 | 237329 |
| `[expr].get` | 1 | 237329 |
| `B.every` | 1 | 237331 |
| `w.get` | 1 | 237332 |
| `B.filter` | 1 | 237334 |
| `J.startsWith` | 1 | 237334 |
| `w.values` | 1 | 237342 |
| `J7` | 1 | 237351 |
| `X.set` | 1 | 237352 |
| `Array.from` | 1 | 237355 |
| `X.values` | 1 | 237355 |
