工具类 format

## [线上示例](https://alwbg.github.io)

## 更新日志

### 版本 1.2.0

- `format`(temp, ...args) 方法

  ```javascript
  format("{name} is {this.age++} years old. Next year, he will be {age}.", {
    name: "Tom",
    age: 3,
  });
  // Tom is 3 years old. Next year, he will be 4.

  // 异常输出
  format("{name} is {this.age++ 1} years old. Next year, he will be {age}.", {
    name: "Tom",
    age: 3,
  });
  /*
  @soei/format
  
  ╰─ {this.age++ 1}
                  ^
                  ╰─  Unexpected number
  输出: Tom is {this.age++ 1} years old. Next year, he will be 1.
  */
  // 多参数
  format(
    "{0.name} is {0.age} years old. Next year, he will be {1} {2}",
    {
      name: "Tom",
      age: 3,
    },
    "bigger",
    "than before",
  );
  // Tom is 3 years old. Next year, he will be bigger than before
  ```

> StringMap 的基本用法

```javascript
// 引入方式
const soei = require("@soei/format");
let StringMap = soei.StringMap;
// 或
import { StringMap } from "@soei/format";
let NM = new StringMap("name,age,sex,height" /* , '|' // 默认'/' */);

NM.toString({
  name: "Tom",
  age: 3,
});
// Tom/3//
NM.toString({
  height: "120cm",
});
// Tom/3//120cm
NM.data();
// { name: 'Tom', age: '3', sex: '', height: '120cm' }
NM.data("jerry/13//130cm");
// { name: 'jerry', age: '13', sex: '', height: '120cm' }
```

> format 的基本用法

```javascript
// 引入方式
const soei = require("@soei/format");
let format = soei.format;
// 或
import { format } from "@soei/format";
```

> - _format('{attr}', args1 );_
> - _format('? ? ? ? ', args1, args2, ... );_

```javascript
format("name: ? age: ? color: ? from: ?", "tom", "2", "blue", "小漂亮国");
// 输出: 'name: tom age: 2 color: blue from: 小漂亮国'
```

```javascript
format("name: ? age: ? color: ? from: ?", "未知");
// 输出: 'name: 未知 age: 未知 color: 未知 from: 未知'
```

```javascript
format("{name} 是个男孩.", { name: "小明" });
// '小明是个男孩.'
```

```javascript
format("name: ? age: ? color: ? from: ?", {
  name: "tom",
  age: "2",
  color: "blue",
  from: "小漂亮国",
});
// 输出: 'name: tom age: 2 color: blue from: 小漂亮国'
```

> **format** 中的随机用法

```javascript
// '...'.['format', 'on'];
format("[red,green,blue,yellow]");
// 随机输出: 'green'
```

> **format** 中的 _三元运算_ 用法 _{expr,true,false}_

```javascript
format("{name,name,age}", {
  name: "",
  age: 1,
});
// 输出: 1
```

```javascript
format("{name>2,+name + 2, +age - 1}", {
  name: "3",
  age: 1,
});
// '5'
```

```javascript
format("{name>2,+name + 2, +age - 1}", {
  name: "2",
  age: 1,
});
// '0'
```

> **format** 中的 _区间随机_ 用法

```javascript
format("{99-999}");
// 随机输出: '610'
```

```javascript
format("{100-999}-{100-999}-{100-999}-{100-999}");
// 输出: '298-768-285-212'
```

> **format** 中的 _属性_ 用法

```javascript
format("{now}");
// 输出: 当前毫秒值
```

```javascript
format("{fx} is in!", {
  fx: () => {
    return "string";
  },
});
// 'string is in!'
format("{fx} is in!", {
  fx: "string",
});
// 'string is in!'
```
