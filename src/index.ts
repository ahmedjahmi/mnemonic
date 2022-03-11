#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/order */
/* eslint-disable import/first */

import config from '../config';

require('dotenv').config({ path: config.env.envPath });

import { program } from 'commander';
import { mnemonicToCsv } from './lib/utils';

program
  .command('gen [wordCount] [pageCount]')
  .description(
    'Generate a mnemonic phrase array that is split across csv pages.'
  )
  .action(mnemonicToCsv);

program.parse();