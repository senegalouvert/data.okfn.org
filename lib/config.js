var CATALOG_URL_DEFAULT = 'https://raw.githubusercontent.com/datasets/registry/master/catalog-list.txt';
var CORE_CATALOG_DEFAULT = 'https://raw.githubusercontent.com/senegalouvert/data/master/catalog-list.txt';

var config = {
  CATALOG_LIST: process.env.CATALOG_LIST || CATALOG_URL_DEFAULT,
  CORE_CATALOG_LIST: process.env.CORE_CATALOG_LIST || CORE_CATALOG_DEFAULT
}

module.exports = config;

