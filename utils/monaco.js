const pactLanguageSpec = require('./pactLanguageSpec');
const loadMonaco  = require('@monaco-editor/loader');

loadMonaco().then(monaco => {
  monaco.languages.register({ id: 'pact'}); 

monaco.languages.setMonarchTokensProvider('pact', pactLanguageSpec);

module.exports = monaco;

});