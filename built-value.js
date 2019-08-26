class BuiltValueAttr {
  constructor(k, resultValue) {
    this.k = k;
    this.rs = resultValue;
  }
}
class BuiltValue {
  constructor(jsObject, rootName) {
    this.jsObject = jsObject;
    this.rootName = rootName;
    this.resultObj = {};
    this.makeResultArr(this.jsObject, this.rootName);
    let resultString = this.makeResultString(this.resultObj);
    resultString = this.addHeader(resultString);
    return new String(resultString);
  }

  // 构建一个built_value树
  makeResultArr(data, name) {
    if (_.isObjectLike(data)) {
      if (_.isArray(data)) {
        data = _.first(data);
      }
      let resultObj = this.resultObj;
      name = _.upperFirst(name);
      resultObj[name] = {};
      resultObj[name]["keys"] = [];
      for (let k in data) {
        let v = data[k];
        let type = typeof v;
        if (type === "object") {
          if (_.isNull(v)) {
            // null
            let dartType = this.createDartType(v);
            resultObj[name]["keys"].push(
              new BuiltValueAttr(k, this.makeBuiltValueAttr(dartType, k))
            );
          } else if (_.isArray(v)) {
            if (_.isEmpty(v)) return;
            // value is array
            // get type of first a value
            let firstv = _.first(v);
            if (_.isArray(firstv))
              return alert(`data error: [ ${JSON.stringify(firstv)}, ...]`);
            if (typeof firstv !== "object") {
              // string, number, boolean
              let dartType = this.createDartType(firstv);
              resultObj[name]["keys"].push(
                new BuiltValueAttr(
                  k,
                  this.makeBuiltValueAttr(dartType, k, true)
                )
              );
            } else {
              let dartType = _.upperFirst(k + "Dto");
              resultObj[name]["keys"].push(
                new BuiltValueAttr(
                  k,
                  this.makeBuiltValueAttr(dartType, k, true)
                )
              );
              this.makeResultArr(firstv, k + "Dto");
            }
          } else if (_.isPlainObject(v)) {
            // object
            let dartType = _.upperFirst(k + "Dto");
            resultObj[name]["keys"].push(
              new BuiltValueAttr(k, this.makeBuiltValueAttr(dartType, k))
            );
            this.makeResultArr(v, k + "Dto");
          }
        } else {
          // string, number, boolean, undefined
          let dartType = this.createDartType(v);
          resultObj[name]["keys"].push(
            new BuiltValueAttr(k, this.makeBuiltValueAttr(dartType, k))
          );
        }
      }
    }
  }

  // 把built_value树，转化为string
  makeResultString(obj) {
    let resultString = ``;
    for (const k in obj) {
      let v = obj[k];

      let attrs = ``;
      for (const key of v.keys) {
        attrs += key["rs"];
      }

      resultString += `
/// ${k}
abstract class ${k} implements Built<${k}, ${k}Builder> {
  ${k}._();

  factory ${k}([updates(${k}Builder b)]) = _$${k};
  ${attrs}

  String toJson() {
    return jsonEncode(serializers.serializeWith(${k}.serializer, this));
  }

  static ${k} fromJson(String jsonString) {
    return serializers.deserializeWith(
        ${k}.serializer, jsonDecode(jsonString));
  }

  static List<${k}> fromListJson(String jsonString) {
    return jsonDecode(jsonString)
        .map<${k}>((e) => fromJson(jsonEncode(e)))
        .toList();
  }

  static Serializer<${k}> get serializer => _$${_.lowerFirst(k)}Serializer;
}\r\n`;
    }
    return resultString;
  }

  // 添加头文件
  addHeader(resultString) {
    let name = _.snakeCase(this.rootName);
    let header = `
/// repo: https://github.com/januwA/p5_object_2_builtvalue
/// generate: https://januwa.github.io/p5_object_2_builtvalue/index.html

library ${name};

import 'dart:convert';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part '${name}.g.dart';
  `;

    return header + resultString;
  }

  makeBuiltValueAttr(dartType, k, isList = false) {
    return !isList
      ? `${dartType == "Null" ? "\r\n  @nullable" : ""}
  @BuiltValueField(wireName: '${k}')
  ${dartType} get ${_.camelCase(k)};
`
      : `
  @BuiltValueField(wireName: '${k}')
  BuiltList<${dartType}> get ${_.camelCase(k)};
`;
  }
  // dart type
  createDartType(v) {
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
