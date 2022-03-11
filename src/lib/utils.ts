import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { generateMnemonic } from 'bip39';
import { format } from 'date-fns';
import config from '../../config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logger = require('node-color-log');

type ShuffledWords = { position: number, word: string }[];
type ShuffledGroups = ShuffledWords[];
type Pages = 2 | 3 | 4 | 5 | 6;

// split array into groups of arrays by page
export function createGroups(arr: ShuffledWords, pages: Pages = 3): ShuffledGroups {
  const res: ShuffledGroups = [];
  const chunkSize = arr.length / pages;
  while (arr.length > 0) {
    const chunk = arr.splice(0, chunkSize);
    res.push(chunk);
  }
  return res;
}

// CSV util
const createCsvWriter = createObjectCsvWriter;

export function writeToCsv(wordGroup: ShuffledWords, csvFile: string): void {
  const csvWriter = createCsvWriter({
    path: csvFile,
    header: [
      { id: 'position', title: 'POSITION' },
      { id: 'word', title: 'WORD' },
    ],
  });

  csvWriter.writeRecords(wordGroup);
}

// print shuffled mnemonic word & position groups to tables
export function printTable(groups: ShuffledGroups): void {
    for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    // eslint-disable-next-line no-console
    console.table(group)
  }
}

const today = format(Date.now(), 'yyyy-MM-dd');
let phraseNumString = process.env.PHRASE_NUM;
let pageNumString = process.env.PAGE_NUM;
if (today > process.env.LAST_DATE) {
  phraseNumString = '1';
}

type WordCount = 24 | 12;

export function mnemonicToCsv(wordCount: WordCount = 24, pageCount: Pages = 3): void {
  // eslint-disable-next-line eqeqeq
  const strength = wordCount == 24 ? 256 : 128;
  const pages = pageCount;
  const mnemonic = generateMnemonic(strength);
  logger.color('black').bgColor('yellow').log('mnemonic:', mnemonic);
  const words = mnemonic.split(' ');
  const wordsAndPositions = Array.from(words, (word, id) => ({
    position: id,
    word,
  }));
  const shuffeledWords: ShuffledWords = wordsAndPositions.sort(() => 0.5 - Math.random());
  const wordGroups = createGroups(shuffeledWords, pages);
  
  printTable(wordGroups)

  const {csvDirPath} = config.csv;

  for (let i = 0; i < wordGroups.length; i += 1) {
    const group = wordGroups[i];
    const csvFileName = `${today}-${phraseNumString}-${pageNumString}-seed-phrase.csv`;
    const csvFile = `${csvDirPath + csvFileName}`
    writeToCsv(group, csvFile);
    let pageNum = Number(pageNumString);
    pageNum += 1;
    pageNumString = pageNum.toString();
    logger.color('black').bgColor('yellow').log(csvFile);
  }
  let pageNum = Number(pageNumString);
  pageNum = 1;
  pageNumString = pageNum.toString();
  let phraseNum = Number(phraseNumString);
  phraseNum += 1;
  phraseNumString = phraseNum.toString();
  const {envPath} = config.env;
  const data = `LAST_DATE=${today}\nPHRASE_NUM=${phraseNumString}\nPAGE_NUM=${pageNumString}`;
  fs.writeFileSync(envPath, data);
}