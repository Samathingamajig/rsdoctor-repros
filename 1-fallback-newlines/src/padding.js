// Importing these makes Rspack emit each one as an asset (see
// rspack.config.mjs for why they exist).
import a from '../padding/a.txt';
import b from '../padding/b.txt';
import c from '../padding/c.txt';

console.log(a, b, c);
