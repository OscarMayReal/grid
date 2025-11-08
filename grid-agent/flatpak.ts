
import gi from '@girs/node-gtk';
import Flatpak from '@girs/node-flatpak-1.0';

gi.startLoop();

export class FlatpakWrapper {
  constructor() {
    this.flatpak = Flatpak;
  }

  flatpak: typeof Flatpak;

  getSystemInstallation() {
    return this.flatpak.Installation.newSystem(null);
  }

  getUserInstallation() {
    return this.flatpak.Installation.newUser(null);
  }

  listInstalledRefs(installation) {
    return installation.listInstalledRefs(null);
  }

  install(installation, remote, ref) {
    return new Promise((resolve, reject) => {
      if (!installation) {
        return reject(new Error('An installation object must be provided'));
      }

      const transaction = this.flatpak.Transaction.newForInstallation(installation, null);
      if (!transaction) {
        return reject(new Error('Failed to create transaction'));
      }

      transaction.on('operation-error', (op, err, details) => {
        console.error(`[Error] ${op.getRef()}: ${err.message}`);
        return false;
      });

      transaction.on('new-operation', (op, progress) => {
        console.log(`Starting: ${op.getRef()}`);
        progress.on('changed', () => {
          const p = progress.getProgress();
          const status = progress.getStatus();
          process.stdout.write(`[${p}%] ${status}\r`);
        });
      });

      transaction.on('operation-done', (op, result) => {
        console.log(`\nDone: ${op.getRef()}`);
      });

      try {
        transaction.addInstall(remote, ref, null);
      } catch (e) {
        return reject(e);
      }

      console.log(`Starting transaction to install ${ref}...`);

      transaction.run_async(null, (source, res) => {
        try {
          const success = source.run_finish(res);
          if (success) {
            resolve();
          } else {
            reject(new Error('Transaction finished but reported failure.'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}