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

/* @see iReplace(...) {\d-\d}匹配提前 $1 $2, 和{prop}部分匹配冲突, 当prop内含有 - 号时*/
var rFormat = /(?:{(\d+)\-(\d+)}|\[([\w-]+)\]|\{([^,{}\[\]]+)\}|\[([^\[\]\{\}'"]+)\]|([\w$\u4e00-\u9fa5]+)(\s*(?:=|:\s*))\?)|{([^,\}\{]+),([^,}]*),([^,}]*)}/g;
var rFormatSp = /(?:,)/;
var iInnerFunx = {
    now: function () { return +new Date; }
}
// 关键词
var KEYWORD = /(?:\W|^)(?:var|let|const|in|while|for|of|this|true|false)\W+/ig;
/* (expr[+-!] | name [expr] | name ? [true] : [false]) name2*/
var rEXPR = /(?:[\+\-\!\.]+|[_$\w]+\s*[><=%\+\-\*/|&!^]|\?\s*[_$]*\w+\s*\:)\s*[_$\w]+/;

var GetOrCheckDataMap = {}

function GetOrCheckData(chr, prop) {
    return isNaN(+prop) ? chr.replace(
        GetOrCheckDataMap[prop] || (GetOrCheckDataMap[prop] = new RegExp("(" + prop + ")"))
        ,
        '_$1'
    ) : chr;
}
// 获取表达式对应的值
function _GetExp2funcValue(exp, data, propertys) {
    var ex, invalid;
    if (rEXPR.test(exp)) {
        var afunArgs = exp.match(/(.?[\w_&$]+)/g),
            //.replace(KEYWORD, SPACE).match(/([\d_$]+\w*)/ig) || [], 
            picker = [], args = [];
        each(afunArgs, function (_, k, picker, data, args) {
            _ = data[k];
            if (_) {
                args.push(GetOrCheckData(k, k));
                exp = GetOrCheckData(exp, k);
                picker.push(_);
            }
        }, picker, data, args);
        ex = new Function(
            // 参数
            args.join(COMMA),
            // 返回值
            'return ' + exp
        )/* 调用 */.apply(Nil, picker);
    } else {
        ex = (
            invalid = isNil(
                ex = data[exp]
            )
        )
            &&
            propertys && /^[_$]*[\w]+$/.test(exp)
            ?
            propertys
            :
            (
                !invalid
                    ?
                    ex
                    :
                    propertys || exp
            );
        if (isFunction(ex)) {
            ex = ex.apply(data, isArray(propertys) ? propertys : isNil(propertys) ? Nil : [propertys])
        }
    };
    return ex;
}

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
/**
 * 替换字符串中含有的 ? 按照顺序替换
 * @param {String} mode 
 * @param {String|Array} args 
 * @returns 
 */
function TextFormat(mode, args) {
    var mat = /\?/;
    if (mat.test(mode)) {
        isArray(args) || (args = iList2Array(arguments), args.shift());
        isString(args) && (args = iSplit(args));
        var list = mode.match(/\?/g), pre;
        for (var i = 0, lenth = list.length; i < lenth; i++) {
            mode = mode.replace(mat, (pre = ((isNil(args[i]) ? pre : args[i]))));
        }
    }
    return mode;
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
        if (/[?]/.test(host) && isArray(args))
            // return 
            host = TextFormat(host, args);
    }
    args || (args = {});
    var has = !!args.now;
    merge(args, iInnerFunx);
    args._groups__ = {};
    // 替换字符串内参数,区间等
    var ret = (host + SPACE).replace(rFormat, iReplace.bind(args));
    delete args._groups__;
    has || (delete args.now);
    return ret;
}

/**
 * @see rFormat
 * @returns String
 */
function iReplace(source /*正则匹配的字符串*/, a /*开始取值范围*/, z /*结束*/,
    arg /*属性 [arg]*/, prpo/* {arg1}, {expr...} */,
    list /*数组 [a, b, c]*/,
    attr /*属性名称 attr=? 替换?为attr对应的属性值 配合后面 eq*/, eq /*等号*/,
    _if, _true, _false
) {
    var args = this, _G = args._groups__;
    if (_G && source in _G) return _G[source];
    // 判断是否为数值
    if (/^\d+$/.test(a + z)) {
        return between(a, z);
    }
    /* 处理类似三目运算  exp(?)true(:)fasle `{true|false|props, value1, value2}` */
    if (_if) {
        return _GetExp2funcValue(
            _GetExp2funcValue(_if, args)
                ? _true
                : _false,
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
    var key = prpo || arg || attr;
    attr || (attr = SPACE, eq || (eq = SPACE));
    if (args && key) {
        var r = Math.random();
        val = _GetExp2funcValue(key, args, r);
        return val == r ? source : attr + eq + val;
    }
    _G[source] = source;
    return source;
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

module.exports = { format: iStringFormat, between, StringMap }