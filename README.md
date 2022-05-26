## General Info

### Metadata

Metadata is used to describe some additional features that can be used by the application. So far, it's used to describe a set of active projects used in the file so it can strictly validate and use them for new records.

#### Example

```
---
Projects:
- First
- Second
- Third
---
```

### Records

Possible values for mark:
- `-` - Skipped
- 1 - Awful
- 2 - Bad
- 3 - So-So
- 4 - Good
- 5 - Excelent

If project is not estimated for the particular day then it's considered as 'skipped' day for this project and should not be used in calculcations.

Date format is YYYY-MM-DD.

#### Example

```
2022-05-20
Project1:Mark
Project2:Mark
Project3:Mark

2022-05-21
Project:Mark
```
