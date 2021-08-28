import Cfg from '@/common/cfg';

export async function cfgInit() {
  await Promise.all([
    Cfg.use('resources/cfg/index.json', 'index', true),
    Cfg.use('resources/cfg/crypto.json', 'crypto', true),
    Cfg.use('resources/cfg/db.json', 'db', true),
    Cfg.use('resources/cfg/socket.json', 'socket', true)
  ]);
}