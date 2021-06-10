import Cfg from './';

export async function cfgInit() {
  await Promise.all([
    Cfg.setCfg('resources/cfg/index.json'),
    Cfg.setCfg('resources/cfg/crypto.json'),
    Cfg.setCfg('resources/cfg/db.json')
  ]);
}
