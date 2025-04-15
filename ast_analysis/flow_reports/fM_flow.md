# Control Flow Analysis: fM

## Function Signature

```javascript
function fM(I, Z, G) { ... }
```

## Control Flow Summary

| Category | Count | Details |
|----------|-------|--------|
| If Statements | 14 | Lines: 260888, 260893, 260895, 260931, 260937, 260945, 260951, 260961, 260963, 260969, 260978, 260984, 260986, 261004 |
| Switch Statements | 0 | None |
| Loops | 0 | For: 0, While: 0, DoWhile: 0, ForIn: 0, ForOf: 0 |
| Try/Catch Blocks | 2 | Lines: 260907, 260943 |
| Return Statements | 0 | None |
| Yield Expressions | 0 | None |
| Await Expressions | 4 | Lines: 260896, 260909, 260915, 260944 |
| Function Calls | 42 | Total calls: 68 |

## If Statement Branches

| Line | Condition | Has Else | Consequent Lines | Alternate Lines |
|------|-----------|----------|-----------------|----------------|
| 260888 | `!W || parseInt(...) < 18` | No | 260889-260892 | N/A |
| 260893 | `Object.keys(...).length > 0` | No | 260894-260894 | N/A |
| 260895 | `AwaitExpression && !oR(...) && !G && !0 && !0` | No | 260901-260929 | N/A |
| 260931 | `V.status === "restored"` | Yes | 260932-260936 | 260937-260942 |
| 260937 | `V.status === "failed"` | No | 260938-260942 | N/A |
| 260945 | `H.status === "restored"` | Yes | 260946-260950 | 260951-260956 |
| 260951 | `H.status === "failed"` | No | 260952-260956 | N/A |
| 260961 | `SequenceExpression` | No | 260961-260961 | N/A |
| 260963 | `SequenceExpression` | No | 260968-260983 | N/A |
| 260969 | `process.platform !== "win32" && typeofprocess.getuid === "function" && process.getuid(...) === 0` | No | 260974-260977 | N/A |
| 260978 | `!f0(...).bypassPermissionsModeAccepted` | No | 260979-260982 | N/A |
| 260984 | `m$2(...)` | No | 260984-260984 | N/A |
| 260986 | `X.lastCost !== void0 && X.lastDuration !== void0` | No | 260987-261003 | N/A |
| 261004 | `!Y` | No | 261004-261004 | N/A |

## Error Handling

| Line | Try Block | Catch Parameter | Has Finally |
|------|----------|-----------------|-------------|
| 260907 | 260907-260919 | `H` (260919-260928) | No |
| 260943 | 260943-260957 | `H` (260957-260959) | No |

## Function Calls

| Function | Call Count | Lines |
|----------|------------|-------|
| `console.log` | 8 | 260902, 260903, 260906, 260916, 260917, 260923, 260932, 260946 |
| `console.error` | 5 | 260889, 260938, 260952, 260974, 260979 |
| `x1` | 5 | 260908, 260915, 260922, 260984, 260987 |
| `process.exit` | 4 | 260892, 260918, 260977, 260982 |
| `f0` | 3 | 260893, 260894, 260978 |
| `_0.yellow` | 3 | 260902, 260933, 260947 |
| `_0.red` | 3 | 260924, 260939, 260953 |
| `String` | 2 | 260920, 260958 |
| `l1` | 2 | 260921, 260958 |
| `[expr].match` | 1 | 260887 |
| `parseInt` | 1 | 260888 |
| `[expr].red` | 1 | 260890 |
| `Object.keys` | 1 | 260893 |
| `Object.assign` | 1 | 260894 |
| `v$` | 1 | 260896 |
| `oR` | 1 | 260897 |
| `kI` | 1 | 260910 |
| `[expr].createElement` | 1 | 260910 |
| `[expr].then` | 1 | 260911 |
| `J` | 1 | 260911 |
| `H` | 1 | 260912 |
| `_0.green` | 1 | 260916 |
| `R$2` | 1 | 260930 |
| `A91` | 1 | 260944 |
| `ms2` | 1 | 260961 |
| `l61` | 1 | 260961 |
| `g81` | 1 | 260961 |
| `uG` | 1 | 260961 |
| `uP` | 1 | 260961 |
| `Au` | 1 | 260961 |
| `Hz` | 1 | 260961 |
| `HX1` | 1 | 260961 |
| `setTimeout` | 1 | 260964 |
| `w.abort` | 1 | 260964 |
| `Hr` | 1 | 260965 |
| `l0` | 1 | 260965 |
| `oA` | 1 | 260966 |
| `process.getuid` | 1 | 260972 |
| `m$2` | 1 | 260984 |
| `B9` | 1 | 260985 |
| `o3` | 1 | 260995 |
| `Ib2` | 1 | 261004 |
