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

import fs from "fs";
import path from "path";
import { getTypeScriptForProtobuf } from "./generator";

describe("Generator", () => {
  const dataDir = path.join(__dirname, "..", "data");

  const files = fs.readdirSync(dataDir);
  files.forEach((protoFilePath) => {
    if (!protoFilePath.endsWith(".proto")) {
      return;
    }

    it(`Can generate TypeScript for ${protoFilePath}`, () => {
      const { typescriptSource, typescriptFilePath } = getTypeScriptForProtobuf(
        fs.readFileSync(path.join(dataDir, protoFilePath), "utf8"),
        path.join(dataDir, protoFilePath)
      );

      expect(typescriptFilePath).toBe(
        `${path
          .join(dataDir, protoFilePath)
          .substring(0, path.join(dataDir, protoFilePath).lastIndexOf("."))}.ts`
      );
      expect(typescriptSource).toMatchSnapshot();
    });
  });
});