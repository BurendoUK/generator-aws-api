import * as fs from 'fs';
import * as path from 'path';

fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
