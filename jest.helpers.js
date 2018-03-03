// Copyright (c) 2015-present, salesforce.com, inc. All rights reserved
// Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license

/* global jasmine */
/* eslint-env jest */

import { assertMatchesDOM } from '@salesforce-ux/instant-vrt/matcher';
import childProcess from 'child_process';
import express from 'express';
import fetch from 'isomorphic-fetch';
import path from 'path';
import puppeteer from 'puppeteer';
import React from 'react';
import ReactDOM from 'react-dom/server';

import { beautify } from './shared/utils/beautify';
import { renderWithBetterError } from './shared/utils/react';

export default (dirname, port) => {
  let CURRENT_TEST_NAME;

  jasmine.getEnv().addReporter({
    specStarted: function(result) {
      CURRENT_TEST_NAME = result.fullName;
    }
  });

  return {
    matchesMarkupAndStyle: async element => {
      const renderedMarkup =
        typeof element === 'string'
          ? element
          : renderWithBetterError(ReactDOM)(
              element,
              `${CURRENT_TEST_NAME} failed on ${element}`
            );
      const markupAndStyle = await fetch(
        'http://localhost:12345/api/getMarkupAndStyle',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: renderedMarkup
        }
      )
        .then(res => res.json())
        .then(diff => ({ html: beautify(renderedMarkup), style: diff.style }));
      assertMatchesDOM(dirname, CURRENT_TEST_NAME, markupAndStyle);
    }
  };
};
