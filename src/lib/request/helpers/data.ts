/*
 * Copyright (c) 2018 by Filestack
 * Some rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { isURLSearchParams, isObject, isFormData, isArrayBuffer, isStream, isFile, isBlob, isBuffer } from './../utils';
import { FsRequestOptions, FsResponse } from './../types';
import { set } from './headers';

/**
 * Prepare request and set content-type header based on data
 *
 * @param headers
 * @param data
 */
export const prepareData = (config: FsRequestOptions) => {
  if (isFormData(config.data) || isArrayBuffer(config.data) || isBuffer(config.data) || isStream(config.data) || isFile(config.data) || isBlob(config.data)) {
    return config;
  }

  if (isURLSearchParams(config.data)) {
    set(config.headers, 'content-type', 'application/x-www-form-urlencoded;charset=utf-8');
    config.data = config.data.toString();
  }

  if (isObject(config.data)) {
    set(config.headers, 'content-type', 'application/json');
    config.data = JSON.stringify(config.data);
  }

  return config;
};

/**
 * Prepare response data based on content type
 *
 * @param response
 */
export const parseResponse = (response: FsResponse): FsResponse => {
  if (!response.headers || !response.headers['content-type']) {
    return response;
  }

  const contentType = response.headers['content-type'];

  if (/application\/json/.test(contentType)) {
    try {
      response.data = JSON.parse(response.data);
    } catch (e) {
      console.error('Cannot parse response', e);
    }
  } else if (/text\/(plain|html)/.test(contentType)) {
    response.data = bufferToString(response.data);
  }

  return response;
};

function bufferToString(buffer) {
  const bufView = new Uint16Array(buffer);
  const length = bufView.length;

  let result = '';
  let addition = Math.pow(2, 16) - 1;

  for (let i = 0; i < length; i += addition) {
    if (i + addition > length) {
      addition = length - i;
    }
    result += String.fromCharCode.apply(null, bufView.subarray(i, i + addition));
  }

  return result;
}
