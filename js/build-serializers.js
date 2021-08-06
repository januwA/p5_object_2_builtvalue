export default class BuildSerializers {
  constructor(rootName) {
    this.rootName = rootName;
  }

  toString() {
    return `
// serializers.dart

import 'package:built_collection/built_collection.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import '${_.snakeCase(this.rootName)}.dart';

part 'serializers.g.dart';

@SerializersFor([
  ${_.upperFirst(this.rootName)}
])
final Serializers serializers = (_$serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();

  `;
  }
}
