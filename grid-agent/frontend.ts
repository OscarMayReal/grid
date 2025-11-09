import gi from '@girs/node-gtk';
import Gtk from '@girs/node-gtk-3.0';
// const Gtk = gi.require('Gtk', '3.0');
import fs from 'fs';
export function init() {
    gi.startLoop();
    Gtk.init(null);
    const win = new Gtk.Window();
    win.title = "Grid Agent";
    win.on('destroy', () => Gtk.mainQuit());
    win.on('delete-event', () => false);
    win.setDefaultSize(400, 180);
    const container = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
    container.setMarginTop(10);
    container.setMarginBottom(10);
    container.setMarginStart(10);
    container.setMarginEnd(10);
    container.setSpacing(10);
    const tokenEntry = new Gtk.Entry({ placeholder_text: 'Device Token' });
    const idEntry = new Gtk.Entry({ placeholder_text: 'Device ID' });
    const urlEntry = new Gtk.Entry({ placeholder_text: 'Server URL' });
    const button = new Gtk.Button({ label: 'Add device' });
    button.connect('clicked', () => {
        console.log('Adding device');
        fs.writeFileSync('./config.json', JSON.stringify({
            deviceId: idEntry.text,
            deviceToken: tokenEntry.text,
            serverUrl: urlEntry.text
        }));
        process.exit(0);
    });
    container.addChild(new Gtk.Builder(), new Gtk.Label({ label: 'Add your device to Grid' }), null);
    container.addChild(new Gtk.Builder(), idEntry, null);
    container.addChild(new Gtk.Builder(), tokenEntry, null);
    container.addChild(new Gtk.Builder(), urlEntry, null);
    container.addChild(new Gtk.Builder(), button, null);

    win.add(container);
    win.showAll();
    Gtk.main();
}
