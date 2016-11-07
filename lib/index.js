'use strict';

import Logger from './Logger';

const PKG = require('../package.json');
const logger = new Logger();

logger.debug(`${PKG.name} v${PKG.version}`);
