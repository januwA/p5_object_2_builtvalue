export class Dto {
  constructor(dtoName, keys = []) {
    this.dtoName = _.upperFirst(dtoName);
    this.keys = keys;
  }

  toString(defaultValue = "") {
    const attrs = this.keys.reduce((acc, it) => (acc += it.toString()), "");
    return `
/// ${this.dtoName}
abstract class ${this.dtoName} implements Built<${this.dtoName}, ${
      this.dtoName
    }Builder> {
  ${this.dtoName}._();

  factory ${this.dtoName}([Function(${this.dtoName}Builder b) updates]) = _$${
      this.dtoName
    };
  ${attrs}

  String toJson() {
    return jsonEncode(serializers.serializeWith(${
      this.dtoName
    }.serializer, this));
  }

  static ${this.dtoName} fromJson(String jsonString) {
    return serializers.deserializeWith(
        ${this.dtoName}.serializer, jsonDecode(jsonString))${defaultValue}
  }

  static List<${this.dtoName}> fromListJson(String jsonString) {
    return jsonDecode(jsonString)
        .map<${this.dtoName}>((e) => fromJson(jsonEncode(e)))
        .toList();
  }

  static Serializer<${this.dtoName}> get serializer => _$${_.lowerFirst(
      this.dtoName
    )}Serializer;
}\r\n`;
  }
}

export class DtoAttr {
  #flaBuiltListString = "";
  constructor(k, dartType, isList = false, flat = 1) {
    this.k = k; // js key
    this.dk = _.camelCase(k); // dart key
    this.dartType = dartType; // dart type
    this.flat = flat; // 数组嵌套层数
    this.isList = isList;
  }

  flaBuiltList() {
    if (!_.isEmpty(this.#flaBuiltListString)) return this.#flaBuiltListString;
    let rStart = "";
    let rEnd = "";
    let num = this.flat;
    while (num >= 1) {
      rStart += `BuiltList<`;
      rEnd += `>`;
      num--;
    }
    this.#flaBuiltListString = rStart + this.dartType + rEnd;
    return this.#flaBuiltListString;
  }

  toString() {
    return !this.isList
      ? `\r\n  @nullable
  @BuiltValueField(wireName: '${this.k}')
  ${this.dartType} get ${this.dk};
`
      : `\r\n  @nullable
  @BuiltValueField(wireName: '${this.k}')
  ${this.flaBuiltList()} get ${this.dk};
`;
  }
}

export class BuiltValue {
  dtoList = [];

  constructor(jsObject, rootName) {
    this.jsObject = jsObject;
    this.rootName = rootName;
    this.makeDtoList(this.jsObject, this.rootName);
  }

  // 将dto列表转换为built_value文件
  toString() {
    let dtoDefaultData = this.makeDtoDefaultData(
      this.dtoList.find(({ dtoName }) => dtoName === this.rootName)
    );

    return this.addHeader(
      this.dtoList.reduce((acc, dto) => {
        let defaultValue =
          dto.dtoName === this.rootName
            ? `.rebuild(
        (b) => b${dtoDefaultData.replace(/^\s*/, "")});`
            : ";";

        acc += dto.toString(defaultValue);
        return acc;
      }, "")
    );
  }

  /**
   *
   * @param {{value: any: num: number}} o
   */
  _parseFlat(o) {
    if (_.isArray(o.value)) {
      o.num++;
      o.value = _.first(o.value);
      return this._parseFlat(o);
    } else {
      return o;
    }
  }

  // 递归遍历json，将构建一个dto列表
  makeDtoList(data, name) {
    if (_.isObjectLike(data)) {
      if (_.isArray(data)) {
        data = _.first(data);
      }
      const dto = new Dto(name);
      this.dtoList.push(dto);
      for (let k in data) {
        const v = data[k];
        if (_.isObjectLike(v)) {
          if (_.isArray(v)) {
            if (_.isEmpty(v)) return;
            // value is array
            // get type of first a value
            const firstv = _.first(v);
            if (_.isArray(firstv)) {
              const r = this._parseFlat({ value: v, num: 0 });
              // 数组嵌套数据 [[any]]，递归获取嵌套层数，直到数组第一个值为非数组为止
              // return alert(`data error: [ ${JSON.stringify(firstv)}, ...]`);
              if (_.isPlainObject(r.value)) {
                let itemK = "";
                for (let i = 0; i < r.num; i++) itemK += "Item";
                const dartType = _.upperFirst(k + itemK + "Dto");
                dto.keys.push(new DtoAttr(k, dartType, true, r.num));
                this.makeDtoList(r.value, dartType);
              } else {
                dto.keys.push(new DtoAttr(k, this.jt2dt(r.value), true, r.num));
              }
            } else if (_.isPlainObject(firstv)) {
              const dartType = _.upperFirst(k + "Dto");
              dto.keys.push(new DtoAttr(k, dartType, true));
              this.makeDtoList(firstv, dartType);
            } else {
              // string, number, boolean, undefined, null
              dto.keys.push(new DtoAttr(k, this.jt2dt(firstv), true));
            }
          } else if (_.isPlainObject(v)) {
            // object
            const dartType = _.upperFirst(k + "Dto");
            dto.keys.push(new DtoAttr(k, dartType));
            this.makeDtoList(v, dartType);
          }
        } else {
          // string, number, boolean, undefined, null
          dto.keys.push(new DtoAttr(k, this.jt2dt(v)));
        }
      }
    }
  }

  // 更具dart的类型返回默认数据
  dartTypeDefayltValue(t) {
    if (t === "int" || t === "double") {
      return 0;
    }

    if (t === "String") {
      return "''";
    }

    if (t === "bool") {
      return false;
    }

    if (t === "Null") {
      return "null";
    }
  }

  makeDtoDefaultData(dto, parent = "", dtoDefaultData = ``) {
    dto?.keys?.forEach((attr) => {
      let param = parent === "" ? attr.dk : `${parent}.${attr.dk}`;
      if (attr.isList) {
        dtoDefaultData += `		  ..${param} ??= ${attr
          .flaBuiltList()
          .replace(/^BuiltList/, " ListBuilder")}()\r\n`;
      } else if (attr.dartType.endsWith("Dto")) {
        let newParent = parent ? parent + "." + attr.dk : attr.dk;
        dtoDefaultData += this.makeDtoDefaultData(
          this.dtoList.find(({ dtoName }) => dtoName === attr.dartType),
          newParent,
          ``
        );
      } else {
        dtoDefaultData += `		  ..${param} ??= ${this.dartTypeDefayltValue(
          attr.dartType
        )}\r\n`;
      }
    });

    return dtoDefaultData;
  }

  // 添加头文件
  addHeader(dtosString) {
    let name = _.snakeCase(this.rootName);
    let header = `
// ${name}.dart
// repo: https://github.com/januwA/p5_object_2_builtvalue
// generate: https://januwa.github.io/p5_object_2_builtvalue/index.html

library ${name};

import 'dart:convert';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'serializers.dart';

part '${name}.g.dart';

// ${JSON.stringify(this.jsObject)}

  `;

    return header + dtosString;
  }

  /**
   * js type to dart type
   * @param {any} v js data
   */
  jt2dt(v) {
    let dartType = "";
    if (_.isInteger(v)) {
      dartType = "int";
    } else if (_.isString(v)) {
      dartType = "String";
    } else if (_.isBoolean(v)) {
      dartType = "bool";
    } else if (_.isNull(v) || _.isUndefined(v)) {
      dartType = "Null";
    } else {
      dartType = "double";
    }
    return dartType;
  }
}
