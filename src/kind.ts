/*
	Copyright 2023 Loophole Labs

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

export enum Kind {
  Null = 0x00,
  Array = 0x01,
  Map = 0x02,
  Any = 0x03,
  Uint8Array = 0x04,
  String = 0x05,
  Error = 0x06,
  Boolean = 0x07,
  Uint8 = 0x08,
  Uint16 = 0x09,
  Uint32 = 0x0a,
  Uint64 = 0x0b,
  Int32 = 0x0c,
  Int64 = 0x0d,
  Float32 = 0x0e,
  Float64 = 0x0f,
}
