let {
    isFunction,
    isArray,
    iList2Array,
    isNil,
    isString,
    isSimplyType,
    merge,
    iSplit,
    each,
    runer: iRuner
} = require('@soei/tools');
var Nil,
    COMMA = ',',
    SPACE = '',
    r_A_Z = /(\d+)\-(\d+)/;

var rFormatSp = /(?:,)/;
/* @see iReplace(...) {\d-\d}匹配提前 $1 $2, 和{prop}部分匹配冲突, 当prop内含有 - 号时*/
var rFormat = /(?:{(\d+)\-(\d+)}|\{([^,{}]+)\}|\[([\w-]+)\]|\[([^\[\]\{\}'"]+)\]|([\w$\u4e00-\u9fa5]+)(\s*(?:=|:\s*))\?)|{([^,\}\{]+),([^,}]*),([^,}]*)}/g;

var rProperty = /(?=\s|^)(?:[+-]{2}|!+|)([\d_$a-z]+[_$\w]*)(?:(?:\??\.[_$\w]+|)(?:(?:\?\.|)\[(['"]*)[\d\w]+\2\]|))*(?:[+-]{2}|)/g,
    filters = [
        [/(?:\[(['"]*)([\d]+)\1\]|(?:this\.|^)(\d+))((?:\.[_$\w]+)*)/g, "this[$2$3]$4"]
    ];


// 内置函数映射
var BUILT_IN_FUNCTIONS = {
    now: function () { return +new Date; }
}

// 缓存正则表达式
var REGEX_CACHE = {}

/**
 * 获取或检查数据，并缓存正则表达式
 * @param {string} chr - 输入字符串
 * @param {string} prop - 属性名
 * @returns {string} - 处理后的字符串
 */
function getOrCheckData(chr, prop) {
    return isNaN(+prop) ? chr.replace(
        REGEX_CACHE[prop] || (REGEX_CACHE[prop] = new RegExp("(" + prop + ")"))
        ,
        '_$1'
    ) : chr;
}
/**
 * 字符串批量替换
 * @param {string} value - 原始字符串
 * @param {Array} replacements - 替换规则列表
 * @returns {string} - 替换后的字符串
 */
function batchReplace(value, replacements) {
    for (var i = 0, val; val = replacements[i++];) {
        value = SPACE.replace.apply(value, val);
    }
    return value;
}
// 获取表达式对应的值
function _GetExp2funcValue(expression, data, invalid) {
    var ex, afunArgs;
    expression = batchReplace(expression, filters);
    if (afunArgs = expression.match(rProperty)) {
        var values = [], args = [];
        each(afunArgs, function (_, k, values, data, args) {
            rProperty.lastIndex = 0;
            k = rProperty.exec(k)[1];
            _ = data[k];
            if (!isNil(_)) {
                args.push(getOrCheckData(k, k));
                expression = getOrCheckData(expression, k);
                values.push(isFunction(_) ? iRuner(_) : _);
            }
        }, values, data, args);
        if (values.length || args.length || expression.indexOf('this') >= 0) {
            ex = new Function(
                // 参数
                args.join(COMMA),
                // 返回值
                'return ' + expression
            )/* 调用 */.apply(data, values);
        } else {
            return invalid;
        }
    } else {
        ex = data[expression] || expression;
    }
    return ex;
}
/**
 * 生成指定范围内的随机数或执行回调
 * @param {number|string} start - 起始值
 * @param {number} end - 结束值
 * @param {Function} callback - 回调函数（可选）
 * @param {boolean} brimless - 是否排除边界值
 * @returns {number|void} - 随机数或回调结果
 */
function between(a, z, callback, brimless/* 无边缘 */) {
    if (isString(a)) {
        let az = a.match(r_A_Z);
        if (az) {
            z = az[2];
            a = az[1];
        }
    }
    var min, max, edge = +!!brimless;
    if (+a < +z) {
        min = +a;
        max = +z;
    } else {
        min = +z;
        max = +a;
    }
    var lof = (max - min) + 1 - 2 * edge;

    if (isFunction(callback)) {
        while (lof-- > 0) {
            if (iRuner(callback, null, min + lof + edge, max, min)) break;
        }
    } else {
        return (Math.random() * 1e6 >> 0) % lof + min;
    }
}
var REGEX_PLACEHOLDER = /\?/;
var REGEX_PLACEHOLDER_G = /\?/g;
/**
 * 替换字符串中的占位符 `?`
 * @param {string} template - 模板字符串
 * @param {Array|string} args - 参数列表
 * @returns {string} - 替换后的字符串
 */
function replacePlaceholders(template, args) {
    if (REGEX_PLACEHOLDER.test(template)) {
        isArray(args) || (args = iList2Array(arguments), args.shift());
        isString(args) && (args = iSplit(args));
        var list = template.match(REGEX_PLACEHOLDER_G), pre;
        for (var i = 0, lenth = list.length; i < lenth; i++) {
            template = template.replace(REGEX_PLACEHOLDER, (pre = ((isNil(args[i]) ? pre : args[i]))));
        }
    }
    return template;
}
/**
 * 字符串格式化 
 * 'key=?|[val]|{1-19}|[1,2,3]'.format({key:1,val:2})
 * key=1|2|3(1-19随机)|2(1,2,3)随机一个
 * @Time   2018-11-13
 */
function iStringFormat(args) {
    var host = this, k2 = arguments.length,
        /* 判断宿主是否依附在 String.prototype 下 */
        notInString = !isString(host) && isString(args);
    if (
        /* 2022-11-07 判断参数是否为format(String, {key: value} | [...] | 1, 2, 3, 4, 'a') */
        k2 > 1
        || isSimplyType(args)
    ) {
        args = iList2Array(arguments);
        if (notInString) {
            // 获取处理对象字符串
            host = args.shift();
            if (args.length == 1 && !isSimplyType(args[0]) /* 非基本类型 */) args = args.shift();
        }
        /* 功能分流 处理 caller('?............? ?', 1, 2, 3) */
        if (REGEX_PLACEHOLDER.test(host) && isArray(args)) host = replacePlaceholders(host, args);
    }
    args || (args = {});
    var has = !!args.now, ret;
    merge(args, BUILT_IN_FUNCTIONS);
    // 替换字符串内参数,区间等
    try {
        ret = (host + SPACE).replace(rFormat, iReplace.bind(args, args._groups__ = {}));
        delete args._groups__;
        has || (delete args.now);
    } catch (e) {
        ret = host;
    }
    return ret;
}

merge(
    String.prototype,
    {
        format: iStringFormat,
        on: iStringFormat
    }
)

/**
 * 替换函数核心逻辑
 * @param {string} source - 匹配到的源字符串
 * @param {string} a - 起始值
 * @param {string} z - 结束值
 * @param {string} arg - 属性名
 * @param {string} prop - 表达式
 * @param {string} list - 数组形式
 * @param {string} attr - 属性名称
 * @param {string} eq - 等号
 * @param {string} condition - 条件表达式
 * @param {string} trueVal - 真值
 * @param {string} falseVal - 假值
 * @returns {string} - 替换结果
 */
function iReplace(groups, source /*正则匹配的字符串*/, a /*开始取值范围*/, z /*结束*/,
    prop/* {arg1}, {expr...} */, arg /*属性 [arg]*/, 
    list /*数组 [a, b, c]*/,
    attr /*属性名称 attr=? 替换?为attr对应的属性值 配合后面 eq*/, eq /*等号*/,
    condition, trueVal, falseVal
) {
    var args = this;
    if (groups && source in groups) return groups[source];
    // 判断是否为数值
    if (/^\d+$/.test(a + z)) {
        return between(a, z);
    }
    /* 处理类似三目运算  exp(?)true(:)fasle `{true|false|props, value1, value2}` */
    if (condition) {
        return _GetExp2funcValue(
            _GetExp2funcValue(condition, args)
                ? trueVal
                : falseVal,
            args
        );
    }
    var val;
    /*是否为数组 处理 `[first, ...]`*/
    if (list) {
        list = iSplit(list, rFormatSp);
        /* [first, 2, 3, ...] first instanceof Function ? first(2, 3, 4,...) */
        val = isFunction(args[list[0]])
            ?
            args[list.shift()].apply(args, list)
            :
            list[between(0, list.length - 1)];
        return val;
    }
    var key = prop || arg || attr;
    if (args && key) {
        try {
            var invalid = Math.random();
            val = _GetExp2funcValue(key, args, invalid);
            return invalid == val ? source : eq ? (attr || SPACE) + eq + val : val;
        } catch (e) {
            MarkErr(e, source);
        }
    }
    groups[source] = source;
    return source;
}
function MarkErr(e, source) {
    source = "@soei/format\n\n ╰─ " + source;

    var stack = e.message || e.stack;
    var errposition = stack.replace(/(?:.*(?:token|number|reading)(?:\:?\s+(["'])((?:(?!\1).)+)\1|).*|(\w+) is not defined)/, '$2$3');
    if (!errposition) {
        errposition = source.match(/([\d]+\.)?\d+/g)[0];
    }
    var offset = Array(Math.max(0, iRuner(-1, source.split('\n')).indexOf(errposition) + 1 + errposition.length / 2 >> 0)).join(' ')
    console.warn(
        source.replace(errposition, '%c' + errposition + '%c')
        + '\n'
        + offset
        + '^\n'
        + offset
        + '╰─ %c '
        + stack,
        "color: #deb887;",
        "color: none;",
        "color: #deb887;"
    );
}
/**
 * 隐藏属性格式化输出
 * @param {Array|String} data 如果是String 'attr[,|;]attr'
 * @param {String} split 默认为 '/'
 */
function StringMap(data, split) {
    if (isString(data)) {
        data = iSplit(data, split || /,|\||;/)
    }
    var list = [], map = {};
    each(data, function (k, v, host, map) {
        map[k] = v;
        host.push(iStringFormat('{!{0},,{0}}', v));
    }, list, this.map = map);
    this.$mode = list.join(this.split = (split || '/'));
    this.$data = {};
}
StringMap.prototype.data = function (mode) {
    if (isNil(mode)) return this.$data;
    let ret = {};
    each(mode.split(this.split), function (k, v, map, ret) {
        ret[map[k]] = v;
    }, this.map, ret)
    return ret;
}
StringMap.prototype.toString = function (data) {
    data = data || {};
    merge(data, this.$data);
    merge(this.$data, data, true);
    return iStringFormat(this.$mode, data)
}

module.exports = {
    format: iStringFormat,
    between,
    StringMap
}