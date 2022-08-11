/*
	Copyright 2022 Loophole Labs

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		   http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

export const isProtoTypeComposite = (protoTypeName: string) => {
  switch (protoTypeName) {
    case "double":
    case "float":
    case "int32":
    case "uint32":
    case "sint32":
    case "fixed32":
    case "sfixed32":
    case "int64":
    case "uint64":
    case "sint64":
    case "fixed64":
    case "sfixed64":
    case "bool":
    case "string":
    case "bytes":
      return false;

    default:
      return true;
  }
};

interface ISrcAST {
  [k: string]: protobuf.AnyNestedObject;
}

interface ISrcType {
  fields: {
    [k: string]: ISrcField;
  };
  values: {
    [k: string]: number;
  };
  nested: ISrcAST;
}

interface ISrcField {
  type: string;
  id: number;
  rule: string;
  keyType: string;
}

interface IDstType {
  typeName: string;
  fields: IDstField[];
}

interface IDstField {
  fieldName: string;
  typeName: string;
  keyTypeName: string;
  isArray: boolean;
  isMap: boolean;
}

interface IDstEnum {
  enumName: string;
  values: string[];
}

export const getTypes = (
  root: ISrcAST,
  knownTypes: IDstType[] = [],
  knownTypeNames: string[] = [],
  prefix = ""
): IDstType[] => [
  ...knownTypes,
  ...Object.keys(root)
    .filter((typeName) => (root[typeName] as ISrcType).fields)
    .map((typeName) => {
      // Hoist known type names
      knownTypeNames.push(prefix + typeName);

      return typeName;
    })
    .map((typeName) => {
      const type = root[typeName] as ISrcType;

      const srcTypeFields = type.fields;

      const ownPrefix = prefix + typeName;
      const parsedType = {
        typeName: ownPrefix,
        fields: Object.keys(srcTypeFields)
          .map((fieldName) => {
            const nestedTypeName = knownTypeNames.find(
              (t) => t === srcTypeFields[fieldName].type
            );

            return {
              fieldName,
              typeName: isProtoTypeComposite(srcTypeFields[fieldName].type)
                ? nestedTypeName || ownPrefix + srcTypeFields[fieldName].type
                : srcTypeFields[fieldName].type,
              keyTypeName: srcTypeFields[fieldName].keyType,
              index: srcTypeFields[fieldName].id,
              isArray: srcTypeFields[fieldName].rule === "repeated",
              isMap: !!srcTypeFields[fieldName].keyType,
            };
          })
          .sort((curr, prev) => curr.index - prev.index)
          .map((field) => ({
            fieldName: field.fieldName,
            typeName: field.typeName,
            keyTypeName: field.keyTypeName,
            isArray: field.isArray,
            isMap: field.isMap,
          })),
      };

      if (type.nested) {
        return getTypes(
          type.nested,
          [parsedType],
          [parsedType.typeName],
          parsedType.typeName
        );
      }

      knownTypes.push(parsedType);
      knownTypeNames.push(parsedType.typeName);

      return [parsedType];
    })
    .reduce((prev, curr) => [...prev, ...curr], []),
];

export const getEnums = (root: ISrcAST): IDstEnum[] =>
  Object.keys(root)
    .filter((typeName) => (root[typeName] as ISrcType).values)
    .map((typeName) => {
      const srcTypeFields = (root[typeName] as ISrcType).values;

      return {
        enumName: typeName,
        values: Object.keys(srcTypeFields)
          .map((field) => ({
            key: field,
            value: srcTypeFields[field],
          }))
          .sort((a, b) => a.value - b.value)
          .map((value) => value.key),
      };
    });

export const getRootAndNamespace = (
  obj: any,
  objPath: string[] = [],
  lastObj: any = undefined
): { root: any; namespace: string[] } => {
  if (!obj || obj.fields || obj.methods) {
    return {
      root: lastObj,
      namespace: objPath.slice(0, -1),
    };
  }

  let nextKey = Object.keys(obj)[0];
  if (nextKey === "options") {
    nextKey = Object.keys(obj)[1];
  }

  if (nextKey === "nested") {
    return getRootAndNamespace(obj[nextKey], objPath, obj);
  }

  return getRootAndNamespace(obj[nextKey], [...objPath, nextKey], obj);
};
